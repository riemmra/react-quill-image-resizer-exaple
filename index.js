/**
 * @fileoverview react-quill-image-resizer para redux form
 *
 * @version                               1.0
 *
 * @author              Ricky Raymundo <riemmra@gmail.com>
 * @copyright           Respetar términos de la licencia GPL-3.0 License
 *
 * History
 * v1.0 – Primera versión 
* La primera versión de aprMenu fue escrita por Karl Monitrix
*/

import React, { Component } from 'react';
import ReactQuill, {Quill} from 'react-quill';
import ImageResize from 'quill-image-resize-module-react'
import 'react-quill/dist/quill.snow.css';
import "highlight.js/styles/darcula.css";
import hljs from "highlight.js";

Quill.register('modules/imageResize', ImageResize);
const modules = {    
    syntax: {
        highlight: (text) => hljs.highlightAuto(text).value,
    },
    toolbar: [
        ["bold", "italic", "underline", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "video"],
        ["clean"],
        ["code-block"],
    ],
    clipboard: {
        matchVisual: false,
    },
    imageResize: {
        modules: [ 'Resize', 'DisplaySize' ]
    }    
};

class QuillEditor extends React.Component {
    constructor(props) {
      super(props)
      this.state = { text: 'Inicial', load: false } 

      this.quillRef = null; 
      this.reactQuillRef = null
    }

    srcToFile = (inputURI, name) => {         
        var inputMIME = inputURI.split(',')[0].split(':')[1].split(';')[0];

        let tipo = ".png"
        if(inputMIME === "image/jpeg"){
            tipo = ".jpg"
        }else if(inputMIME === "image/gif"){
            tipo = ".gif"
        }

        var byteString = atob(inputURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var blob = new Blob([ia], { type: inputMIME });
        var file = new File([blob], `${name}${tipo}`);
        return file;
    }

    objToStr = (ob) => {
        let cad = ''; let i=true;
        for (const [key, value] of Object.entries(ob)) {            
            //cad += i ? `${key}="${value}"` : ` ${key}=${value}`;
            cad += ` ${key}="${value}"`;
        }
        return cad;
    }

    componentDidMount = () => {
        if(!this.state.load){
            const {input} = this.props;
            this.setState({text: input.value, load: true});
        }

        this.attachQuillRefs()
    }
      
    componentDidUpdate = () => {
        this.attachQuillRefs()
    }
      
    attachQuillRefs = () => {
        if (typeof this.reactQuillRef.getEditor !== 'function') return;
        this.quillRef = this.reactQuillRef.getEditor();
    }

    getImages = () => {        
        const {input} = this.props;
        let html_content;
        const images=[];
        if (!!this.reactQuillRef){
            html_content = this.state.text;
            const delta = this.quillRef.getContents();            
            let contador_imagenes = 0;
            delta.forEach((op)=> {                
                const attr = op.attributes ? this.objToStr(op.attributes) : '';                
                if(typeof op.insert === "object" && op.insert.hasOwnProperty('image')){                                        
                    const new_tag = `<img src="imagen_${contador_imagenes.toString()}"${attr} />`
                    html_content = html_content.replace(`<img src="${op.insert.image}"${attr}>`, new_tag);
                    
                    //Para prevenir la etiqueta style que se activa al redimensionar (por la selección y deselección).
                    html_content = html_content.replace(`<img src="${op.insert.image}"${attr} style="">`, new_tag);
                    html_content = html_content.replace(`<img src="${op.insert.image}"${attr} style="cursor: nwse-resize;">`, new_tag);

                    var myFile = this.srcToFile(op.insert.image, `imagen_${contador_imagenes}`);
                    images.push({name: `imagen_${contador_imagenes}`, file: myFile});
                    contador_imagenes ++;
                }
            });            
        }

        const object = {images, html_content}
        input.onChange(object);
    }

    handleChange = (value) => {                                
        this.setState({ text: value });
        this.getImages();                
    }
   
    render() {
        const {input} = this.props;

        return (
            <React.Fragment>
                <ReactQuill 
                    ref={(el) => { this.reactQuillRef = el }}
                    modules={modules} 
                    value={this.state.text}                    
                    onChange={this.handleChange} 
                />
                <button onClick={()=>this.getImages()}>Obtener Imágenes</button>
            </React.Fragment>
        )
    }
}

export default QuillEditor;
