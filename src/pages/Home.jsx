import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <div className="">
        <Link to="/dashboard" className="btn btn-primary border-2 border-red-600 py-2 px-4">Go to Dashboard</Link>
      </div>
    </div>
  )
}