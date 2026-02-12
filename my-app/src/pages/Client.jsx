import React, { useState, useEffect } from "react";
import { Bell, User, Search, X, PackageSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Client() {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [featuredListings, setFeaturedListings] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  // ✅ For gig modal
const [showGigModal, setShowGigModal] = useState(false);
const [selectedGig, setSelectedGig] = useState(null);
const [isRequesting, setIsRequesting] = useState(false);


  const [request, setRequest] = useState({
    title: "",
    description: "",
    skills: "",
    price: "",
    duration: "",
    tags: "",
  });

  // ✅ Load user data
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUserData(JSON.parse(stored));
  }, []);

  // ✅ Fetch categories (top-level occupations)
  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        const res = await fetch("http://localhost:5000/categories/occupations");
        const data = await res.json();
        if (res.ok) {
          setOccupations(data);
        } else {
          console.error("❌ Failed to fetch occupations:", data.error);
        }
      } catch (err) {
        console.error("❌ Error fetching occupations:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchOccupations();
  }, []);

  // ✅ Fetch up to 5 random listings per occupation
  useEffect(() => {
    const fetchListings = async () => {
      if (occupations.length === 0) return;

      const listingsData = {};
      try {
        for (const occ of occupations) {
          const res = await fetch(
            `http://localhost:5000/listings/random/${encodeURIComponent(occ.name)}`
          );
          const data = await res.json();
          listingsData[occ.name] = res.ok ? data : [];
        }
        setFeaturedListings(listingsData);
      } catch (err) {
        console.error("❌ Error fetching listings:", err);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, [occupations]);

  // ✅ Fetch user requests
  const fetchRequests = async () => {
    if (!userData) return;

    try {
      const res = await fetch(
        `http://localhost:5000/requests?user_id=${userData.id}`
      );
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      } else {
        alert(`❌ Failed to load requests: ${data.error}`);
      }
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
      alert("Server error while fetching requests.");
    }
  };

  // ✅ Handle form field changes
  const handleRequestChange = (e) => {
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  // ✅ Selected occupation and skills state + fetch skills for occupation
  const [selectedOccupation, setSelectedOccupation] = useState(occupations?.[0]?.category_id || "");
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    // when occupations change, initialize selectedOccupation
    if (occupations && occupations.length > 0 && !selectedOccupation) {
      setSelectedOccupation(occupations[0].category_id);
    }
  }, [occupations]);

  useEffect(() => {
    // fetch skills for selected occupation
    const fetchSkills = async () => {
      if (!selectedOccupation) return;
      try {
        const res = await fetch(`http://localhost:5000/categories/skills/${selectedOccupation}`);
        const data = await res.json();
        if (res.ok) {
          setSkillsOptions(data);
        } else {
          setSkillsOptions([]);
        }
      } catch (err) {
        console.error("❌ Error fetching skills:", err);
        setSkillsOptions([]);
      }
    };
    fetchSkills();
  }, [selectedOccupation]);

  // toggle skill selection and keep request.skills as comma-separated string
  const toggleSelectSkill = (skillName) => {
    setSelectedSkills((prev) => {
      const exists = prev.includes(skillName);
      const next = exists ? prev.filter((s) => s !== skillName) : [...prev, skillName];
      setRequest((r) => ({ ...r, skills: next.join(", ") }));
      return next;
    });
  };

  // ✅ Submit request to backend
  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (!userData) {
      alert("⚠️ Please log in first.");
      return;
    }

    const payload = {
      user_id: userData.id,
      title: request.title,
      description: request.description,
      skills: request.skills,
      tags: request.tags
        ? request.tags.split(",").map((t) => t.trim())
        : [],
      price: request.price,
      duration: request.duration,
    };

    try {
      const response = await fetch("http://localhost:5000/create-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Request Created Successfully (ID: ${data.request_id})`);
        setRequest({
          title: "",
          description: "",
          skills: "",
          price: "",
          duration: "",
          tags: "",
        });
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error creating request:", error);
      alert("Server error. Please try again later.");
    }
  };

  // ✅ Open Requests Modal & Load Data
  const handleOpenRequests = async () => {
    await fetchRequests();
    setShowRequestsModal(true);
  };

  // ✅ Add tag
  const handleAddTag = (tagValue) => {
    const tag = tagValue.trim();
    if (tag && (!request.tags || request.tags.split(",").length < 5)) {
      const newTags = request.tags ? `${request.tags},${tag}` : tag;
      setRequest({ ...request, tags: newTags });
    }
  };

  // ✅ Remove tag
  const handleRemoveTag = (tagToRemove) => {
    const updated = request.tags
      .split(",")
      .filter((t) => t.trim() !== tagToRemove.trim())
      .join(",");
    setRequest({ ...request, tags: updated });
  };
  // ✅ Handle requesting a listing
  const handleRequestListing = async (listingID) => {
    if (!userData) {
      alert("⚠️ Please log in first.");
      return;
    }

    setIsRequesting(true);
    try {
      const response = await fetch(
        `http://localhost:5000/listings/request/${listingID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userData.id }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("✅ Listing successfully requested!");
        setShowGigModal(false);
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (err) {
      console.error("❌ Error requesting listing:", err);
      alert("Server error. Please try again later.");
    } finally {
      setIsRequesting(false);
    }
  };


  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans">
      {/* ===== TOP NAVBAR ===== */}
      <nav className="bg-white border-b border-neutral-300 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Search bar */}
          <div className="flex items-center w-1/2 bg-neutral-100 rounded-full px-4 py-2 border border-neutral-300">
            <Search className="text-neutral-500 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search for freelancers, skills, or services..."
              className="w-full bg-transparent focus:outline-none text-sm text-neutral-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = e.target.value.trim();
                  if (query) {
                    navigate(`/search33?query=${encodeURIComponent(query)}`);
                  }
                }
              }}
            />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/client-req')} className="relative text-neutral-700 hover:text-neutral-900 transition">
              <Bell size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <button onClick={() => navigate('/client-finder')} className="relative text-neutral-700 hover:text-neutral-900 transition">
              <PackageSearch size={20} />
            </button>

            <button onClick={() => navigate('/client-orders')} className="font-medium hover:text-neutral-900 transition text-sm">
              Orders
            </button>

            {/* Profile */}
            <div
              onClick={() => setShowProfileModal(true)}
              className="w-9 h-9 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-700 font-semibold cursor-pointer hover:bg-neutral-400 transition"
            >
              <User size={18} />
            </div>
          </div>
        </div>
      </nav>

      {/* ===== CATEGORY BAR (Dynamic Occupations) ===== */}
      <div className="bg-white border-b border-neutral-300 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-12 py-3 text-sm font-medium">
          {loadingCategories ? (
            <span className="text-gray-500">Loading categories...</span>
          ) : occupations.length === 0 ? (
            <span className="text-gray-500">No categories available</span>
          ) : (
            occupations.map((cat) => (
              <button
                key={cat.category_id}
                className="hover:text-neutral-900 text-neutral-700 transition"
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ===== MAIN SECTION ===== */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 px-3 py-6">
        {/* ===== LEFT: Request Box ===== */}
        <div className="md:w-1/3 bg-white rounded-2xl shadow p-6 overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-semibold mb-4">📦 Create a Request</h2>

          <form onSubmit={handleRequestSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={request.title}
                onChange={handleRequestChange}
                placeholder="Enter request title"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={request.description}
                onChange={handleRequestChange}
                placeholder="Describe your request..."
                rows="3"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
            </div>

            {/* Skills: select occupation then pick skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none mb-3"
              >
                {occupations.map((occ) => (
                  <option key={occ.category_id} value={occ.category_id}>
                    {occ.name}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (select one or more)</label>
              {skillsOptions.length === 0 ? (
                <p className="text-xs text-gray-500">No skills available for this occupation.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {skillsOptions.map((s) => (
                    <button
                      key={s.category_id}
                      type="button"
                      onClick={() => toggleSelectSkill(s.name)}
                      className={`px-3 py-1 rounded-full text-sm border transition ${selectedSkills.includes(s.name) ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  name="tag"
                  type="text"
                  placeholder="Add a tag"
                  className="flex-1 border rounded-lg px-4 py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector("input[name='tag']");
                    handleAddTag(input.value);
                    input.value = "";
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>

              {/* Display added tags */}
              {request.tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {request.tags.split(",").map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag.trim()}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range ($)
              </label>
              <input
                type="text"
                name="price"
                value={request.price}
                onChange={handleRequestChange}
                placeholder="e.g. 50 - 100"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                name="duration"
                value={request.duration}
                onChange={handleRequestChange}
                placeholder="Enter delivery time"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition"
              >
                Create Request
              </button>

              <button
                type="button"
                onClick={handleOpenRequests}
                className="w-full bg-gray-200 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-300 transition"
              >
                View My Requests
              </button>
            </div>
          </form>
        </div>

        {/* ===== RIGHT: Featured Freelancers ===== */}
        <div className="md:w-2/3 bg-white rounded-2xl shadow p-6 overflow-y-auto max-h-[90vh]">
          <h2 className="text-lg font-semibold mb-4">🧑‍💻 Featured Freelancers</h2>
          {loadingListings ? (
            <p className="text-gray-500">Loading featured gigs...</p>
          ) : (
            occupations.map((occ) => {
              const gigs = featuredListings[occ.name] || [];
              return (
                <div key={occ.category_id} className="mb-6">
                  <h3 className="text-md font-semibold mb-2 text-gray-800">
                    {occ.name}
                  </h3>
                  {gigs.length === 0 ? (
                    <p className="text-gray-400 text-sm mb-3">No gigs yet</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {gigs.map((gig) => (
                        <div
                            key={gig.listingID}
                            onClick={() => {
                              setSelectedGig(gig);
                              setShowGigModal(true);
                            }}
                            className="border rounded-xl p-4 bg-gray-50 hover:shadow-md cursor-pointer transition"
                          >

                          <h4 className="font-semibold text-gray-900 line-clamp-1">
                            {gig.title}
                          </h4>
                          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                            {gig.description}
                          </p>
                          {/* show freelancer info when available */}
                          {gig.freelancer_name && (
                            <div className="mt-2 text-sm text-gray-700 flex items-center justify-between">
                              <div>
                                <span className="font-medium">{gig.freelancer_name}</span>
                                {gig.avg_rating ? (
                                  <span className="ml-2 text-yellow-600">⭐ {gig.avg_rating} ({gig.review_count})</span>
                                ) : null}
                              </div>
                            </div>
                          )}
                          <p className="text-gray-700 text-sm mt-2">
                            💰 ${gig.price} • ⏱ {gig.duration} days
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== PROFILE MODAL ===== */}
      {showProfileModal && userData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">👤 User Profile</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>ID:</strong> {userData.id}</p>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Role:</strong> {userData.role}</p>
              <p><strong>Created:</strong> {new Date(userData.created).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== REQUESTS MODAL ===== */}
      {showRequestsModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative">
            <button
              onClick={() => setShowRequestsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold mb-6 text-center">📜 My Requests</h2>

            {requests.length === 0 ? (
              <p className="text-center text-gray-500">No requests found.</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {requests.map((req) => (
                  <div
                    key={req.request_id}
                    className="border rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">
                        {req.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        ⏱ {req.duration} days
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{req.description}</p>
                    <p className="text-gray-500 text-xs">
                      💰 {req.price_range || "N/A"} | 🧩 {req.skills || "N/A"}
                    </p>

                    {/* ✅ Display tags */}
                    {req.tags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {req.tags.split(",").map((tag, i) => (
                          <span
                            key={i}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ===== GIG MODAL ===== */}
{showGigModal && selectedGig && (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
      <button
        onClick={() => setShowGigModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        <X size={22} />
      </button>

      <h2 className="text-xl font-semibold mb-3 text-center">
        {selectedGig.title}
      </h2>
      <p className="text-gray-600 text-sm mb-4">{selectedGig.description}</p>

      <div className="text-sm text-gray-700 space-y-2">
        <p><strong>💰 Price:</strong> ${selectedGig.price}</p>
        <p><strong>⏱ Duration:</strong> {selectedGig.duration} days</p>
        <p><strong>📂 Category:</strong> {selectedGig.category}</p>
      </div>

      <button
        onClick={() => handleRequestListing(selectedGig.listingID)}
        disabled={isRequesting}
        className={`w-full mt-6 py-2 rounded-lg text-white font-medium transition ${
          isRequesting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isRequesting ? "Requesting..." : "📩 Request This Listing"}
      </button>
    </div>
  </div>
)}



    </div>

      

  );
}
