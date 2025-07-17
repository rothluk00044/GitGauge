export default function Settings() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">GitHub Token</h2>
          <input 
            type="password" 
            placeholder="Enter GitHub token"
            className="border p-2 w-full"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Theme</h2>
          <select className="border p-2 w-full">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
      </div>
    </div>
  );
}