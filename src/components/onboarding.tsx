"use client";

import { useState } from "react";
import { Section } from "../components/layout/Section";
import { Heading } from "../components/typography/Heading";
import { Sparkles, User, CheckSquare } from "lucide-react";
import Footer from "../components/Footer";

interface FormData {
  name: string;
  role: string;
  genres: string[];
  mediums: string[];
  styles: string[];
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ name: "", role: "", genres: [], mediums: [], styles: [] });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckbox = (field: keyof FormData, value: string) => {
    setForm((prev) => {
      const has = prev[field].includes(value);
      return {
        ...prev,
        [field]: has ? prev[field].filter((i) => i !== value) : [...prev[field], value],
      };
    });
  };

  const handleSubmit = async () => {
    const res = await fetch(`https://api.airtable.com/v0/${process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID}/Onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
      },
      body: JSON.stringify({
        fields: {
          Name: form.name,
          Role: form.role,
          Genres: form.genres.join(", "),
          Mediums: form.mediums.join(", "),
          Styles: form.styles.join(", ")
        },
      }),
    });
    if (res.ok) alert("Submitted successfully");
    else alert("Error submitting data");
  };

  const steps = [
    {
      label: "Welcome",
      icon: <Sparkles className="w-6 h-6 text-green-400" />,
      content: (
        <div className="animate-fade-in space-y-4">
          <Heading>Welcome to Quillaborn 👋</Heading>
          <p className="text-lg text-gray-300 max-w-xl">
            You're about to enter a creative world built for collaboration. Let’s set up your profile and find projects that match your energy.
          </p>
        </div>
      )
    },
    {
      label: "Set Up Profile",
      icon: <User className="w-6 h-6 text-green-400" />,
      content: (
        <div className="animate-fade-in space-y-4">
          <Heading>Your Creator Identity</Heading>
          <p className="text-lg text-gray-300">Tell us a bit about your skills, style, and goals.</p>
          <input
            name="name"
            placeholder="Your name or alias"
            value={form.name}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
          />
          <input
            name="role"
            placeholder="Artist, Writer, Developer..."
            value={form.role}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
          />
        </div>
      )
    },
    {
      label: "Choose Interests",
      icon: <CheckSquare className="w-6 h-6 text-green-400" />,
      content: (
        <div className="animate-fade-in space-y-6">
          <Heading>Find Your Kindred Creators</Heading>
          <p className="text-lg text-gray-300">Select what you love most in these 3 categories.</p>

          <div>
            <h3 className="font-bold mb-2">Genres</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Fantasy", "Sci-fi", "Romance", "Drama"].map((tag) => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.genres.includes(tag)}
                    onChange={() => handleCheckbox("genres", tag)}
                    className="accent-green-500"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Mediums</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Comics", "Animation", "Writing", "Music"].map((tag) => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.mediums.includes(tag)}
                    onChange={() => handleCheckbox("mediums", tag)}
                    className="accent-green-500"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Collaboration Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Co-write", "Art trade", "Feedback", "Project join"].map((tag) => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.styles.includes(tag)}
                    onChange={() => handleCheckbox("styles", tag)}
                    className="accent-green-500"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-950"></div>
      <div className="absolute inset-0 opacity-50 bg-gray-900"></div>

      <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-green-400/20 rounded-lg rotate-45 animate-float hidden lg:block"></div>
      <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-green-300/30 rounded-full animate-float hidden lg:block"></div>

      <div className="relative z-10">
        <header className="relative z-50 px-6 py-4 border-b border-gray-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gray-900" />
              </div>
              <h1 className="text-xl font-bold">Quillaborn</h1>
            </div>
          </div>
        </header>

        <div className="px-6 py-16 max-w-3xl mx-auto">
          <div className="h-2 mb-6 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          <Card className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                {steps[step].icon}
                <Heading>Getting Started</Heading>
              </div>
              <span className="text-stone-400">Step {step + 1} of {steps.length}</span>
            </div>

            <div className="space-y-6 transition duration-300 ease-in-out">
              {steps[step].content}
            </div>

            <div className="flex justify-between pt-10">
              <Button
                onClick={() => (step === 0 ? navigate("/") : setStep(step - 1))}
                variant="secondary"
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>Next</Button>
              ) : (
                <Button onClick={handleSubmit}>Submit</Button>
              )}
            </div>
          </Card>
        </div>

        <Footer />
      </div>
    </div>
  );
}
