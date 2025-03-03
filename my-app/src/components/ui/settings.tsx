import { useState } from "react";

export default function SettingsPopUp() {
  const [spotifyId, setSpotifyId] = useState(
    localStorage.getItem("spotifyId") || ""
  );
  const [speaker, setSpeaker] = useState(localStorage.getItem("speaker") || "");
  const [showNotification, setShowNotification] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState(
    localStorage.getItem("selectedOption") || ""
  );
  const [selectedRadio, setSelectedRadio] = useState(
    localStorage.getItem("selectedRadio") || ""
  );

  const handleChange = (setter) => (e) => setter(e.target.value);

  const showNotificationForChange = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSave = () => {
    // Get stored systems from localStorage
    const storedSystems = JSON.parse(localStorage.getItem("systems")) || [];

    // Find the matching device based on roomName
    const matchingDevice = storedSystems.find(
      (device) => device.roomName === speaker
    );

    // Update speaker to host if found
    const updatedSpeaker = matchingDevice ? matchingDevice : speaker;

    // Save updated values
    localStorage.setItem("spotifyId", spotifyId);
    localStorage.setItem("speaker", JSON.stringify(updatedSpeaker));
    localStorage.setItem("selectedOption", selectedOption);
    localStorage.setItem("selectedRadio", selectedRadio);

    showNotificationForChange();
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {showNotification && (
        <div className="absolute top-6 right-6 bg-black text-white font-semibold px-8 py-2 rounded-full animate-in transition-all">
          <p>Settings Updated</p>
        </div>
      )}

      {isOpen && (
        <section className="h-fit w-96 bg-white border-[#7c7c7c3e] border-[2px] z-50 rounded-lg font-semibold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4">
          <div className="flex justify-between items-center">
            <h1 className="mb-4">Settings</h1>
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label>My Speaker</label>
            <input
              type="text"
              value={speaker}
              onChange={handleChange(setSpeaker)}
              className="mt-2 p-2 w-full border-[#7c7c7c3e] border-[1px] text-black bg-slate-50 rounded-[5px] text-sm"
              placeholder="Enter speaker name"
            />
          </div>
          <div className="mb-4">
            <label>Spotify ID</label>
            <p className="text-sm">To access spotify you need to provide project/acces id</p>
            <input
              type="text"
              value={spotifyId}
              onChange={handleChange(setSpotifyId)}
              className="mt-2 p-2 w-full border-[#7c7c7c3e] border-[1px] text-black bg-slate-50 rounded-[5px]"
              placeholder="Enter Spotify ID"
            />
          </div>

          <div className="mb-4">
            <label>Custom method</label>
            <p className="text-sm font-medium">
              Click the first icon in the header to use
            </p>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="mt-2 p-2 w-full border-[#7c7c7c3e] border-[1px] text-black bg-slate-50 rounded-[5px]"
            >
              <option value="">Select...</option>
              <option value="radio">Radio</option>
              <option value="playlist">Playlist</option>
              <option value="song">Song</option>
              <option value="mute">Mute</option>
              <option value="play">Play</option>
            </select>
          </div>

          {selectedOption === "radio" && (
            <div className="mb-4">
              <label>Select Radio Station</label>
              <select
                value={selectedRadio}
                onChange={(e) => setSelectedRadio(e.target.value)}
                className="mt-2 p-2 w-full border-[#7c7c7c3e] border-[1px] text-black bg-slate-50 rounded-[5px]"
              >
                <option value="">Select Radio</option>
                <option value="fm957">FM957</option>
                <option value="bylgjan">Bylgjan</option>
                <option value="k100">K100</option>
              </select>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={handleSave}
              className="bg-black text-white py-3 px-6 w-full rounded-full text-sm"
            >
              Save
            </button>
          </div>
        </section>
      )}
    </>
  );
}
