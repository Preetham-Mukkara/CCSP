import axios from "./axios"
import React, {useEffect,useState} from "react"
import './App.css';
import {ReactComponent as PlaceHolder} from './placeholder.svg'
import Fdd from "./Fdd";
import'./Fdd.css'


function App() {
  const [result,setResult] = useState("")

  useEffect(()=>{
    axios.get("api/hello").then((response) => {
      setResult(response.data);
     });
  },[])

  function updateInfo(){
    axios.get("api/update").then((response) => {
      setResult(response.data);
     });
  }

  const onUpload = (files) =>{
    console.log(files)
  }

  return (
    <>
    <div>
      <Fdd onUpload={onUpload} count={3} formats={['pdf']}>
        <div className='FilesDragAndDropArea'>
            Hey, drop me some files
            <PlaceHolder/>
        </div>
      </Fdd>
    </div>
    </>
  );
}

export default App ;
