import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {ReactComponent as Drop} from './cheekydrop.svg'
import {ReactComponent as Error} from './error.svg'
import {ReactComponent as Success} from './success.svg'
import './Fdd.css'

export default function Fdd({onUpload,children,count,formats}){
    const drop = useRef(null)
    const drag = useRef(null)
    const [dragging,setDragging] = useState(false)
    const [message,setMessage] = useState({
        show: false,
        text: null,
        type: null
    })
    const showMessage = (text,type,timeout) =>{
        setMessage({
            show:true,
            text,
            type,
        });

        setTimeout(()=> setMessage({
            show: false,
            text: null,
            type: null,
        }),timeout);
    }
    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }
    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setDragging(false)
        //Required to convert Filelist object to array
        const files = [...e.dataTransfer.files]

        // check if the provided count prop is less than uploaded count of files
        if (count && count < files.length) {
            showMessage(`Nope, only ${count} file${count !== 1 ? 's' : ''} can be uploaded at a time`, 'error', 2000);
            return;
          }

        // check if some uploaded file is not in one of the allowed formats
        if (formats && files.some((file) => !formats.some((format) => file.name.toLowerCase().endsWith(format.toLowerCase())))) {
            showMessage(`Nope, only following file formats are acceptable: ${formats.join(', ')}`, 'error', 2000);
            return;
          }               

        //checking if files exist and passing them to parent component via onUpload
        if (files && files.length) {
            showMessage('Yep, that\'s what I want', 'success', 1000);
            onUpload(files);
          }
    }
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.target !== drag.current) {
            setDragging(true);
          }     
         };
      
      const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.target === drag.current) {
            setDragging(false);
          }      
        };

    /**
     * adding event listeners for drop and dragover events to prevent their
     * default behavior (opening the dropped file)
     * 
    */
    useEffect(()=> {
        const dc = drop.current
        dc.addEventListener('dragover',handleDragOver)
        dc.addEventListener('drop',handleDrop)
        dc.addEventListener('dragenter',handleDragEnter)
        dc.addEventListener('dragleave',handleDragLeave)
        return ()=>{
            dc.removeEventListener('dragover',handleDragOver)
            dc.removeEventListener('drop',handleDrop)
            dc.removeEventListener('dragenter',handleDragEnter)
            dc.removeEventListener('dragleave',handleDragLeave)
        }
    },[])


    return (
        <div ref={drop} className='FilesDragAndDrop'>
            {message.show && (
                <div
                className={`FilesDragAndDropPlaceholder${message.type}`}>
                 {message.text}
                 {message.type === 'error' ? <Error/>:<Success/>}   
                </div>
            )}
            {dragging && (
                <div ref={drag} className='FilesDragAndDropPlaceholder'>
                    Drop that file down low
                    <Drop/>
                </div>
            )}
             {children}
        </div>
    )
}

Fdd.propTypes = {
    onUpload: PropTypes.func.isRequired,
}