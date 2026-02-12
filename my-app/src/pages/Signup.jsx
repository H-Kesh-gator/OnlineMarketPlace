import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    occupation: "",
    occupation_id: "",
    skills: [],
    education: "",
    phone: "",
    description: "",
  });

  // === Dynamic categories (occupations + skills) ===
  const [occupations, setOccupations] = useState([]);
  const [skills, setSkills] = useState([]);

  // === Fetch occupations on mount ===
  useEffect(() => {
    fetch("http://localhost:5000/categories/occupations")
      .then((res) => res.json())
      .then((data) => setOccupations(data))
      .catch((err) => console.error("❌ Error fetching occupations:", err));
  }, []);

  // === Fetch skills when occupation changes ===
  const fetchSkills = (occupationId) => {
    fetch(`http://localhost:5000/categories/skills/${occupationId}`)
      .then((res) => res.json())
      .then((data) => setSkills(data))
      .catch((err) => console.error("❌ Error fetching skills:", err));
  };

  // === Handle skill selection (max 5) ===
  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const alreadySelected = prev.skills.includes(skill);
      let updatedSkills = alreadySelected
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];

      if (updatedSkills.length > 5) {
        alert("You can select a maximum of 5 skills");
        return prev;
      }

      return { ...prev, skills: updatedSkills };
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // === Step Navigation ===
  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email))
      return alert("Please enter both name and email");

    if (step === 2 && !formData.role)
      return alert("Please choose a role");

    if (step === 3 && formData.role === "freelancer") {
      if (!formData.occupation || formData.skills.length === 0 || !formData.education)
        return alert("Please fill all freelancer fields and choose up to 5 skills");
    }

    if (step === 4 && formData.role === "freelancer") {
      if (!formData.phone || !formData.description)
        return alert("Please enter your phone number and description");
    }

    if (step === 2 && formData.role === "client") {
      setStep(5);
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (formData.role === "client" && step === 5) {
      setStep(2);
    } else {
      setStep(step - 1);
    }
  };

  // === Final Submission ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "client") {
      try {
        const response = await fetch("http://localhost:5000/signup-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("✅ Client added:", data);
          navigate("/client", { state: formData });
        } else {
          alert(data.error || "Something went wrong");
        }
      } catch (error) {
        console.error("Signup error:", error);
        alert("Server error, please try again later");
      }
    } else if (formData.role === "freelancer") {
      try {
        const response = await fetch("http://localhost:5000/signup-freelancer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            occupation: formData.occupation,
            occupation_id: formData.occupation_id,
            skills: formData.skills.join(", "),
            education: formData.education,
            phone: formData.phone,
            description: formData.description,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("✅ Freelancer added:", data);
          navigate("/freelancer", { state: formData });
        } else {
          alert(data.error || "Something went wrong");
        }
      } catch (error) {
        console.error("Signup error:", error);
        alert("Server error. Please try again later.");
      }
    } else {
      alert("Please choose a role before submitting.");
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="signup-heading">
          {step === 1 && "Step 1: Enter your details"}
          {step === 2 && "Step 2: Choose your role"}
          {step === 3 && formData.role === "freelancer" && "Step 3: Freelancer details"}
          {step === 4 && formData.role === "freelancer" && "Step 4: Contact & Bio"}
          {step === 5 && "✅ Signup Complete"}
        </h2>

        {/* Step 1 - Basic Info */}
        {step === 1 && (
          <>
            <label className="block mb-2 font-semibold text-gray-700 text-lg">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="signup-input"
            />

            <label className="block mb-2 font-semibold text-gray-700 text-lg">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="signup-input mb-8"
            />

            <button type="button" onClick={nextStep} className="btn-primary">
              Next →
            </button>
          </>
        )}

        {/* Step 2 - Role */}
        {step === 2 && (
          <>
            <label className="block mb-4 font-semibold text-gray-700 text-lg text-center">
              Choose your role
            </label>
            <div className="flex justify-center gap-8 mb-8">
              <label
                className={`role-option ${
                  formData.role === "client" ? "role-option-active" : "role-option-inactive"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === "client"}
                  onChange={handleChange}
                />
                Client
              </label>

              <label
                className={`role-option ${
                  formData.role === "freelancer" ? "role-option-active" : "role-option-inactive"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="freelancer"
                  checked={formData.role === "freelancer"}
                  onChange={handleChange}
                />
                Freelancer
              </label>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next →
              </button>
            </div>
          </>
        )}

        {/* Step 3 - Freelancer Details */}
        {step === 3 && formData.role === "freelancer" && (
          <>
            <label className="block mb-2 font-semibold text-gray-700 text-lg">
              Your Occupation
            </label>
            <select
              name="occupation"
              value={formData.occupation_id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedName = e.target.options[e.target.selectedIndex].text;

                setFormData((prev) => ({
                  ...prev,
                  occupation: selectedName,
                  occupation_id: selectedId,
                  skills: [],
                }));

                fetchSkills(selectedId);
              }}
              className="signup-input"
            >
              <option value="">Select your occupation</option>
              {occupations.map((occ) => (
                <option key={occ.category_id} value={occ.category_id}>
                  {occ.name}
                </option>
              ))}
            </select>

            {skills.length > 0 && (
              <>
                <p className="text-sm text-gray-700 mb-4">
                  Choose <span className="font-semibold">up to five</span> of your best
                  skills in {formData.occupation}.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {skills.map((skill) => (
                    <label
                      key={skill.category_id}
                      className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer transition 
                        ${
                          formData.skills.includes(skill.name)
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill.name)}
                        onChange={() => toggleSkill(skill.name)}
                        className="hidden"
                      />
                      <span>{skill.name}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            <label className="block mb-2 font-semibold text-gray-700 text-lg">Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="e.g. B.Tech in Computer Science"
              className="signup-input mb-8"
            />

            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next →
              </button>
            </div>
          </>
        )}

        {/* Step 4 - Freelancer Contact & Bio */}
        {step === 4 && formData.role === "freelancer" && (
          <>
            <label className="block mb-2 font-semibold text-gray-700 text-lg">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="signup-input mb-6"
            />

            <label className="block mb-2 font-semibold text-gray-700 text-lg">
              Description / Bio
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your background or work experience"
              rows="4"
              className="signup-input mb-8 resize-none"
            ></textarea>

            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next →
              </button>
            </div>
          </>
        )}

        {/* Step 5 - Confirmation */}
        {step === 5 && (
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-8">
              🎉 Thank you, <span className="font-semibold">{formData.name}</span>!
              <br /> You signed up as a <b>{formData.role}</b>.
              {formData.role === "freelancer" && (
                <>
                  <br />Occupation: {formData.occupation}
                  <br />Skills: {formData.skills.join(", ")}
                  <br />Education: {formData.education}
                  <br />Phone: {formData.phone}
                  <br />Description: {formData.description}
                </>
              )}
            </p>
            <button type="submit" className="btn-green">
              Finish
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
