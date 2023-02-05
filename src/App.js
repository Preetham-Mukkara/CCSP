import axios from "./axios"
import React, {useEffect,useState} from "react"
import './App.css';

function App() {
  const [result,setResult] = useState("")


  useEffect(()=>{
    axios.get("api/hello").then((response) => {
      setResult(response.data);
     });
  },[])
  return (
    <div className="App">
      {result && <h1>{result}</h1>}
    </div>
  );
}

export default App;
