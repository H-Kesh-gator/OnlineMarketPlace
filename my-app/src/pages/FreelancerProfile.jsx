import { useState, useEffect } from "react";
import { Star, MapPin, Clock, X, Bell, PackageSearch, Inbox, DollarSign } from "lucide-react";
import { useLocation , useNavigate } from "react-router-dom";

export default function FreelancerProfile() {
  const navigate = useNavigate();

  const handleAcceptRequest = async (requestId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Please log in first");
      return;
    }
    const user = JSON.parse(storedUser);

    try {
      const response = await fetch(`http://localhost:5000/accept-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          freelancer_id: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Request accepted successfully!");
        setShowSearchModal(false);
        handleSearch(searchQuery); // Refresh search results
      } else {
        alert(`❌ Error: ${data.error || "Failed to accept request"}`);
      }
    } catch (err) {
      console.error("❌ Error accepting request:", err);
      alert("Server error. Please try again.");
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchModal(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `http://localhost:5000/search-requests?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSearchResults(data);
      setShowSearchModal(true);
    } catch (err) {
      console.error("❌ Search error:", err);
      alert("Error searching requests");
    } finally {
      setIsSearching(false);
    }
  };

  const location = useLocation();
  const [freelancerData, setFreelancerData] = useState(null);
  const [listings, setListings] = useState([]);
  const [showListingModal, setShowListingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // ✅ Requested gigs modal

  // Reviews state
  const [reviews, setReviews] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  // ✅ Requests (notifications) modal

  // Tag input state (controlled)
  const [tagInput, setTagInput] = useState("");

  const [listing, setListing] = useState({
    title: "",
    description: "",
    selectedSkills: [],
    tags: [],
    price: "",
    duration: "",
    category: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    if (user.role !== "freelancer") return;

    fetch(`http://localhost:5000/freelancer-profile?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setFreelancerData(data);
        fetch(`http://localhost:5000/listings?user_id=${user.id}`)
          .then((res) => res.json())
          .then((listingsData) => setListings(listingsData))
          .catch((err) => console.error("❌ Failed to fetch listings:", err));
      })
      .catch((err) => console.error("❌ Failed to fetch freelancer profile:", err));
  }, []);

  const refreshListings = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    try {
      const res = await fetch(`http://localhost:5000/listings?user_id=${user.id}`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error("❌ Failed to refresh listings:", err);
    }
  };

  const truncate = (text, length = 80) =>
    text?.length > length ? text.slice(0, length) + "..." : text;

  // Add tag helper (keeps tags as an array)
  const addTag = (t = tagInput) => {
    const tag = String(t).trim();
    if (!tag) return;
    if (listing.tags.includes(tag)) return;
    if (listing.tags.length >= 5) {
      alert("Max 5 tags allowed");
      return;
    }
    setListing((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  };

  const removeTag = (tag) => {
    setListing({ ...listing, tags: listing.tags.filter((t) => t !== tag) });
  };

  const toggleSkill = (skill) => {
    setListing((prev) => {
      const alreadySelected = prev.selectedSkills.includes(skill);
      const updated = alreadySelected
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill];
      return { ...prev, selectedSkills: updated };
    });
  };

  const handleCreateListing = async () => {
    if (
      !listing.title ||
      !listing.description ||
      !listing.selectedSkills.length ||
      !listing.price ||
      !listing.duration
    ) {
      alert("Please fill all fields before submitting.");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("User not found in localStorage");
      return;
    }

    const user = JSON.parse(storedUser);
    const payload = {
      user_id: user.id,
      title: listing.title,
      description: listing.description,
      selectedSkills: listing.selectedSkills, // array
      tags: listing.tags, // array
      price: listing.price,
      duration: listing.duration,
      category: freelancerData?.occupation || "",
    };

    try {
      const response = await fetch("http://localhost:5000/create-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Listing "${listing.title}" created successfully! (ID: ${data.listingID})`);
        setShowListingModal(false);
        setListing({
          title: "",
          description: "",
          selectedSkills: [],
          tags: [],
          price: "",
          duration: "",
          category: freelancerData?.occupation || "",
        });
        setTagInput("");
        refreshListings();
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error creating listing:", error);
      alert("Server error. Please try again later.");
    }
  };

  const filteredListings = listings;


  // Fetch reviews for freelancer and show modal
  const openReviews = async () => {
    if (!freelancerData) return;
    const freelancerId = freelancerData.user_id || freelancerData.id;
    if (!freelancerId) {
      setReviews([]);
      setShowReviewsModal(true);
      return;
    }
    setReviewsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/freelancer-reviews?freelancer_id=${freelancerId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
      setShowReviewsModal(true);
    }
  };

  // helper to normalize tags/skills from either array or comma-string
  const normalizeList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return String(val)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* ===== TOP BAR ===== */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-semibold text-gray-800">Freelancer Dashboard</h1>

                    <div className="flex items-center w-1/2 bg-gray-100 rounded-full px-4 py-2 border border-gray-300">
            <input
              type="text"
              placeholder="Press Enter to search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/search13?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="w-full bg-transparent focus:outline-none text-sm text-gray-700"
            />
          </div>

          <div className="flex items-center gap-6">
                  <button
            onClick={() => navigate("/notif")}
            className="relative text-gray-700 hover:text-gray-900 transition"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

            <button onClick={() => navigate('/orders')} className="text-gray-700 hover:text-gray-900 transition">
              <PackageSearch size={22} />
            </button>
            <button onClick={() => navigate('/freelancer-claimed')} className="text-gray-700 hover:text-gray-900 transition">
              <Inbox size={22} />
            </button>
            <button onClick={() => navigate('/freelancer-finance')} className="text-gray-700 hover:text-gray-900 transition">
              <DollarSign size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-col md:flex-row p-6 gap-8">
        {/* LEFT PANEL */}
        <div className="md:w-1/3 bg-white rounded-2xl shadow p-6 flex flex-col">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-3"></div>
            <h2 className="text-xl font-semibold">{freelancerData?.name || "Freelancer Name"}</h2>

            {freelancerData?.avg_rating ? (
              <div className="text-yellow-500 mt-1 text-sm">
                ★ {Number(freelancerData.avg_rating).toFixed(1)}
              </div>
            ) : null}
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <MapPin size={16} /> From: {"India"}
            </p>

            <p className="flex items-center gap-2">
              <Clock size={16} />
              {freelancerData?.last_review_stars ? (
                <span>Recent Delivery: ★ {freelancerData.last_review_stars} — {new Date(freelancerData.last_review_date).toLocaleString()}</span>
              ) : (
                <span>Recent Delivery: N/A</span>
              )}
            </p>
          </div>

          <div className="mt-6 border-t pt-4 text-gray-700 flex-1">
            <h3 className="font-semibold mb-2">Description</h3>
            <p>{freelancerData?.description || "Loading description..."}</p>

            {freelancerData?.occupation && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Occupation</h3>
                <p>{freelancerData.occupation}</p>
              </div>
            )}

            {freelancerData?.skills && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancerData.skills.split(",").map((skill, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {freelancerData?.education && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Education</h3>
                <p>{freelancerData.education}</p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button onClick={() => setShowListingModal(true)} className="w-full bg-black text-white rounded-xl py-2 hover:bg-gray-800 transition">+ Create Listing</button>

            <button onClick={openReviews} className="w-full bg-gray-200 text-gray-800 rounded-xl py-2 hover:bg-gray-300 transition">💬 View Reviews</button>
          </div>
        </div>

        {/* RIGHT: Gigs */}
        <div className="md:w-2/3 bg-white rounded-2xl shadow p-6 flex flex-col max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 pb-2">Your Gigs</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.length > 0 ? (
              filteredListings.map((gig) => (
                <div key={gig.listingID} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md p-4 flex flex-col justify-between relative group transition">
                  {/* Gig Content - Clickable */}
                  <div onClick={() => setSelectedGig(gig)} className="cursor-pointer">
                    <div className="h-32 bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-gray-400 text-sm">
                      <span className="text-xl">📦</span>
                      <span className="ml-2">Gig #{gig.listingID}</span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{gig.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{truncate(gig.description, 80)}</p>

                      <div className="text-green-600 font-medium">${gig.price}</div>
                      <div className="text-gray-500 text-xs mt-1">⏱ {gig.duration} days • {gig.category}</div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="mt-3 flex justify-end border-t pt-3">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('🗑️ Are you sure you want to delete this listing?\nThis action cannot be undone.')) {
                          const storedUser = localStorage.getItem("user");
                          if (!storedUser) {
                            alert("⚠️ Please log in first");
                            return;
                          }
                          const user = JSON.parse(storedUser);
                          try {
                            const response = await fetch(
                              `http://localhost:5000/listings-delete/${gig.listingID}?user_id=${user.id}`,
                              { 
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                              }
                            );
                            const data = await response.json();
                            if (response.ok) {
                              alert('✅ Listing deleted successfully');
                              refreshListings();
                            } else {
                              alert(`❌ Error: ${data.error || 'Failed to delete listing'}`);
                            }
                          } catch (err) {
                            console.error('❌ Error deleting listing:', err);
                            alert('⚠️ Server error. Please make sure the server is running and try again.');
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <span className="text-lg">🗑️</span>
                      <span className="text-sm font-medium">Delete Listing</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No gigs found. Create one to get started!</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal: View Full Gig */}
      {selectedGig && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setSelectedGig(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={22} /></button>

            <h2 className="text-xl font-semibold mb-3 text-center">{selectedGig.title}</h2>
            <p className="text-gray-600 text-sm mb-4">{selectedGig.description}</p>

            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <p><strong>💰 Price:</strong> ${selectedGig.price}</p>
              <p><strong>⏱ Duration:</strong> {selectedGig.duration} days</p>
              <p><strong>📂 Category:</strong> {selectedGig.category}</p>

              {/* Tags (normalize array/string) */}
              {(() => {
                const tagsArr = normalizeList(selectedGig.tags);
                if (tagsArr.length === 0) return null;
                return (
                  <div className="mt-3">
                    <strong>🏷️ Tags:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tagsArr.map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Skills (normalize array/string) */}
              {(() => {
                const skillsArr = normalizeList(selectedGig.selectedSkills);
                if (skillsArr.length === 0) return null;
                return (
                  <div className="mt-3">
                    <strong>🛠️ Skills:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {skillsArr.map((s, i) => (
                        <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Reviews modal */}
      {showReviewsModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl relative">
            <button onClick={() => setShowReviewsModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={22} /></button>
            <h3 className="text-xl font-semibold mb-4 text-center">Reviews</h3>

            {reviewsLoading ? (
              <p className="text-center text-gray-500">Loading reviews...</p>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.reviewID} className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{r.clientName || `Client #${r.clientID}`}</div>
                      <div className="text-sm text-yellow-500">★ {Number(r.stars).toFixed(1)}</div>
                    </div>
                    <div className="text-sm text-gray-700">{r.comment || "-"}</div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Not yet done</p>
            )}
          </div>
        </div>
      )}

      {/* Create Listing modal */}
      {showListingModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl relative">
            <button onClick={() => setShowListingModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={22} /></button>
            <h2 className="text-xl font-semibold mb-6 text-center">📝 Create a New Listing</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input type="text" placeholder="Enter gig title" value={listing.title} onChange={(e) => setListing({ ...listing, title: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea placeholder="Describe your gig" value={listing.description} onChange={(e) => setListing({ ...listing, description: e.target.value })} className="w-full border rounded-lg px-4 py-2 resize-none" rows="3" />
              </div>

              {freelancerData?.skills && (
                <div>
                  <label className="block font-semibold mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData.skills.split(",").map((skill, idx) => (
                      <button key={idx} type="button" onClick={() => toggleSkill(skill.trim())} className={`px-3 py-1 rounded-full text-sm border transition ${listing.selectedSkills.includes(skill.trim()) ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{skill.trim()}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags controlled input */}
              <div>
                <label className="block font-semibold mb-2">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 border rounded-lg px-4 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => addTag()}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {listing.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-black">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Price ($)</label>
                <input type="number" value={listing.price} onChange={(e) => setListing({ ...listing, price: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
              </div>

              <div>
                <label className="block font-semibold mb-1">Duration (days)</label>
                <input type="number" value={listing.duration} onChange={(e) => setListing({ ...listing, duration: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <input type="text" readOnly value={freelancerData?.occupation || "Not Available"} className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
              </div>

              <button onClick={handleCreateListing} className="w-full bg-green-600 text-white py-2 rounded-xl mt-4 hover:bg-green-700 transition">✅ Create Listing</button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 flex justify-center items-start pt-20 bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isSearching ? "Searching..." : `Search Results (${searchResults.length})`}
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No matching requests found
                </p>
              ) : (
                searchResults.map((request) => (
                  <div
                    key={request.request_id}
                    className="border rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{request.title}</h4>
                        <p className="text-sm text-gray-600">
                          by {request.client_name || "Anonymous"}
                        </p>
                      </div>
                      <span className="text-green-600 font-medium">
                        ${request.price}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {request.description}
                    </p>
                    
                    {request.tags && request.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {request.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}                        
                      </div>
                    )}
                    
                    {request.skills && request.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {request.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}                        
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        ⏱ {request.duration} days
                      </span>
                      <button
                        onClick={() => handleAcceptRequest(request.request_id)}
                        className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-700"
                      >
                        Accept Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
