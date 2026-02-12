import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const SearchClient33 = () => {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("query");
  const [searchResults, setSearchResults] = useState([]);
  const [requesting, setRequesting] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/search-listings33?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleRequestListing = async (listingID) => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      alert("⚠️ Please log in first to request a listing.");
      navigate("/");
      return;
    }

    const user = JSON.parse(stored);
    const userId = user.id || user.user_id;

    if (!userId) {
      alert("⚠️ Invalid user. Please log in again.");
      navigate("/");
      return;
    }

    try {
      setRequesting((s) => ({ ...s, [listingID]: true }));
      const res = await axios.post(`http://localhost:5000/listings/request/${listingID}`, {
        user_id: userId,
      });

      if (res.status === 200) {
        alert("✅ Listing requested successfully.");
        // Remove the listing from the current results since search endpoint only returns available listings
        setSearchResults((prev) => prev.filter((r) => r.listingID !== listingID));
      } else {
        alert(`❌ ${res.data?.error || 'Failed to request listing'}`);
      }
    } catch (err) {
      console.error("Error requesting listing:", err);
      alert("❌ Error requesting listing. Try again later.");
    } finally {
      setRequesting((s) => ({ ...s, [listingID]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Search Results for "{searchQuery}"
          </h2>
          <p className="text-gray-600 mt-2">
            Found {searchResults.length} listings matching your search
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {searchResults.map((result) => (
            <div
              key={result.listingID}
              className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{result.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    ${result.price}
                  </p>
                  <p className="text-sm text-gray-500">{result.duration}</p>
                </div>
              </div>

              <div className="mt-4">
                {result.selectedSkills && result.selectedSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.selectedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.tags && result.tags.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>
                  <p>
                    Posted by{" "}
                    <span className="font-medium">{result.freelancer_name}</span>
                  </p>
                  <p>Posted on {formatDate(result.created_at)}</p>
                </div>
                <p className="text-gray-600">{result.category}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleRequestListing(result.listingID)}
                  disabled={!!requesting[result.listingID]}
                  className={`px-4 py-2 rounded-md text-white font-medium transition ${requesting[result.listingID] ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {requesting[result.listingID] ? 'Requesting...' : '📩 Request'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No listings found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchClient33;
