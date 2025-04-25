import './App.css'


import React, { useEffect, useState } from 'react';
import { debounce } from "lodash";

const DoctorListingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [allSpecialties, setAllSpecialties] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const res = await fetch("https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json");
    const data = await res.json();
    const parsed = data.map(doc => ({
      ...doc,
      specialty: doc.specialities[0]?.name || "",
      feesValue: parseInt(doc.fees.replace(/[^0-9]/g, ""), 10),
      experienceValue: parseInt(doc.experience.replace(/[^0-9]/g, ""), 10),
      consultationTypeList: [
        doc.video_consult && "online",
        doc.in_clinic && "in-person"
      ].filter(Boolean)
    }));
    setDoctors(parsed);
    setFilteredDoctors(parsed);
    const specialties = Array.from(new Set(parsed.map(doc => doc.specialty)));
    setAllSpecialties(specialties);
  };

  useEffect(() => {
    filterDoctors();
  }, [search, consultationType, selectedSpecialties, sortOption]);

  const filterDoctors = () => {
    let filtered = [...doctors];

    if (search) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (consultationType) {
      filtered = filtered.filter(doc => doc.consultationTypeList.includes(consultationType));
    }

    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter(doc => selectedSpecialties.includes(doc.specialty));
    }

    if (sortOption === "fees-asc") {
      filtered.sort((a, b) => a.feesValue - b.feesValue);
    } else if (sortOption === "fees-desc") {
      filtered.sort((a, b) => b.feesValue - a.feesValue);
    } else if (sortOption === "exp-asc") {
      filtered.sort((a, b) => a.experienceValue - b.experienceValue);
    } else if (sortOption === "exp-desc") {
      filtered.sort((a, b) => b.experienceValue - a.experienceValue);
    }

    setFilteredDoctors(filtered);
  };

  const debouncedSearch = debounce(value => {
    setSearch(value);
  }, 300);

  const toggleSpecialty = specialty => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(item => item !== specialty)
        : [...prev, specialty]
    );
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {/* Filter Panel */}
      <div className="col-span-1 space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Consultation Type</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="consultation" value="online" onChange={e => setConsultationType(e.target.value)} />
              Online
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="consultation" value="in-person" onChange={e => setConsultationType(e.target.value)} />
              In-Person
            </label>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Specialties</h2>
          <div className="h-40 overflow-y-auto border rounded p-2">
            {allSpecialties.map(specialty => (
              <label key={specialty} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={selectedSpecialties.includes(specialty)}
                  onChange={() => toggleSpecialty(specialty)}
                />
                {specialty}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Sort By</h2>
          <select
            onChange={e => setSortOption(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select option</option>
            <option value="fees-asc">Fees: Low to High</option>
            <option value="fees-desc">Fees: High to Low</option>
            <option value="exp-asc">Experience: Low to High</option>
            <option value="exp-desc">Experience: High to Low</option>
          </select>
        </div>
      </div>

      {/* Doctor List + Search Bar */}
      <div className="col-span-3 space-y-4">
        <input
          type="text"
          placeholder="Search doctor by name..."
          onChange={e => debouncedSearch(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map(doc => (
            <div key={doc.id} className="border rounded shadow p-4">
              <img src={doc.photo} alt={doc.name} className="w-24 h-24 rounded-full object-cover mb-2" />
              <h3 className="text-lg font-bold">{doc.name}</h3>
              <p>{doc.specialty}</p>
              <p>{doc.doctor_introduction}</p>
              <p>Consultation: {doc.consultationTypeList.join(", ")}</p>
              <p>Fees: {doc.fees}</p>
              <p>Experience: {doc.experience}</p>
              <p>Languages: {doc.languages.join(", ")}</p>
              <p>Clinic: {doc.clinic.name}</p>
              <p>Location: {doc.clinic.address.locality}, {doc.clinic.address.city}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorListingPage;
