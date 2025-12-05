import "./Loading.css";
import { GridLoader } from "react-spinners";
export default function Loading() {
  return (
    <div className="loading">
      <span>Loading Content...</span>
      <GridLoader size={5} color={"var(--secondary-color)"} />
    </div>
  );
}
