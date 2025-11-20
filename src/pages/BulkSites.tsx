// Bulk Sites page (renamed from Automation)
import { useState } from "react";

const BulkSites = () => {
  const [sites, setSites] = useState([]);

  // Add logic for bulk site generation here

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Bulk Sites</h1>
      {/* Render bulk sites UI here */}
      <div>
        <p>Bulk site generation logic goes here.</p>
      </div>
    </div>
  );
};

export default BulkSites;
