import { useState } from "react";
import axios from "axios";

export default function ReportForm() {
 const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Poor Streetlight");
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState([]);
const [selectedLocation, setSelectedLocation] = useState(null);

const searchLocations = async (query) => {
console.log("Searching:", query);
 setAddress(query);

  if (query.trim().length < 2) {
    setSuggestions([]);
    return;
  }

  try {

    const res = await axios.get(
      "http://127.0.0.1:5000/locations/search",
      {
        params: {
          q: query
        }
      }
    );

    setSuggestions(res.data);

  } catch (err) {

    console.error(err);

  }

};

const submitReport = async () => {

 if (!address.trim())  {
    alert("Please select a location.");
    return;
  }

  // if (!description.trim()) {
  //   alert("Please enter a description.");
  //   return;
  // }

  try {

    const res = await axios.post(
      "http://127.0.0.1:5000/citizen/report",
      {
    address,

    latitude: selectedLocation.latitude,

    longitude: selectedLocation.longitude,

    category,

    description
}
    );

    alert(
      `Report submitted successfully!\nReport ID: ${res.data.report_id}`
    );

    // Reset form
    setAddress("");
    setCategory("Poor Streetlight");
    setDescription("");
    setSuggestions([]);

  } catch (err) {

    console.error(err);

    alert(
      err.response?.data?.error || "Failed to submit report."
    );

  }

};

  return (
    <div className="max-w-3xl bg-white rounded-xl shadow p-8">

      <div className="space-y-6">

        {/* Location */}

        <div className="relative">

          <label className="block mb-2 font-medium">

        Incident Address

    </label>

    <input
        type="text"
        value={address}
        onChange={(e) => searchLocations(e.target.value)}
        placeholder="Example: No. 45, 8th Cross, Malleshwaram, Bengaluru"
        className="w-full border rounded-lg px-4 py-3"
    />

          {suggestions.length > 0 && (

  <div className="absolute left-0 right-0 top-full mt-1 z-[9999] bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">

    {suggestions.map((item) => (

      <button
    key={item.address}
    type="button"
    onClick={() => {

    setSelectedLocation(item);

    setAddress(item.address);

    setSuggestions([]);

}}
    className="block w-full text-left px-4 py-3 hover:bg-gray-100"
>

    {item.address}

</button>

    ))}

  </div>

)}

        </div>

        {/* Category */}

        <div>

          <label className="block mb-2 font-semibold">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          >

            <option>Poor Streetlight</option>
            <option>Suspicious Activity</option>
            <option>Illegal Parking</option>
            <option>Garbage Dumping</option>
            <option>Traffic Obstruction</option>
            <option>Drug Activity</option>
            <option>Abandoned Vehicle</option>
            <option>Other</option>

          </select>

        </div>

        {/* Description */}

        <div>

          <label className="block mb-2 font-semibold">
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            className="w-full border rounded-lg px-4 py-3 resize-none"
          />

        </div>

        {/* Button */}

      <button
  type="button"
  onClick={submitReport}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
>
  Submit Report
</button>

      </div>

    </div>
  );
}