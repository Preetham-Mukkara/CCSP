import axios from "./axios"
import React, {useEffect} from "react"
import './App.css';
import {ReactComponent as PlaceHolder} from './placeholder.svg'
import Fdd from "./Fdd";
import'./Fdd.css'


function App() {

  useEffect(()=>{},[])

  const onUpload = (files) =>{
    for(let i =0; i < files.length;i++){
      const formData = new FormData()
      formData.append('File',files[i])
      axios.post("/api/file",formData,{
        headers:{
          "Content-Type": "multipart/form-data"
        }
      }).then((response=>{
        console.log(response.data)
      }))
    }
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

export default App;
