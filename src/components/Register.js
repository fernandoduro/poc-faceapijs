import Input from '@mui/material/Input';
import { Button, TextField } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { LibContext } from '../App';

import * as faceapi from 'face-api.js';

export default function RegisterComponent() {
    const imgRef = useRef();
    const imgRefSearch = useRef();
    let { selectedLib } = useContext(LibContext);

    const [registredFaces, setRegistredFaces] = useState([]);
    const [faceMatcher, setFaceMatcher] = useState()

    useEffect(() => {
        let registredFacesStorage = localStorage.getItem('faces');
        let memRegistredFaces = [];

        if (registredFacesStorage) {
            memRegistredFaces = JSON.parse(registredFacesStorage)
            setRegistredFaces(memRegistredFaces);
        }

        const loadModels = async () => {
        const MODEL_URL = process.env.PUBLIC_URL + '/models-faceapi';
    
        Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            ]).then(() => {
                console.log('Models loaded')
                console.log(memRegistredFaces)

                if (memRegistredFaces.length) {
                    let registredFacesTyped = memRegistredFaces.map(r => { return new faceapi.LabeledFaceDescriptors(r.label, r.descriptors.map(d => { return new Float32Array(d) }))})
                    const faceMatcher = new faceapi.FaceMatcher(registredFacesTyped)
                    setFaceMatcher(faceMatcher);
                }
            });
        }
        loadModels();
    }, []);

    const registerParticipant = (e) => {
        e.preventDefault();
        
        // console.log(e);

        // console.log(selectedLib);
        
        // Get a reference to the file
        const file = e.target.elements['image'].files[0];
        
        // Encode the file using the FileReader API
        const reader = new FileReader();
        reader.onloadend = () => {
            // // Use a regex to remove data url part
            // const base64String = reader.result
            // .replace('data:', '')
            // .replace(/^.+,/, '');
            
            // console.log(base64String);
            // console.log(reader.result)
            switch(selectedLib) {
                case('face-api'):
                faceApiRegister(e.target.elements, reader.result);
                break;
            }
            // Logs wL2dvYWwgbW9yZ...
        };
        reader.readAsDataURL(file);
    }
    
    const faceApiRegister =  async (formFields, imageBlob) => {
        imgRef.current.setAttribute('src', imageBlob);

        const results = await faceapi
        .detectAllFaces(imgRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors()
      
        if (!results.length) {
            return
        }

        const labeledDescriptors = [
            ...registredFaces,
            new faceapi.LabeledFaceDescriptors(
                formFields['name'].value,
                [results[0].descriptor]
            )
        ]
        setRegistredFaces(labeledDescriptors);
        localStorage.setItem('faces', JSON.stringify(labeledDescriptors))
        
        console.log(labeledDescriptors)
        console.log(typeof labeledDescriptors)

        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors.map(r => { 
            return new faceapi.LabeledFaceDescriptors(r.label, r.descriptors.map(d => { 
                return new Float32Array(d) 
            }))
        }))
        
        setFaceMatcher(faceMatcher);

        return
    }

    const searchImg = (e) => {
        e.preventDefault();
        const file = e.target.elements['imageSearch'].files[0];
        
        const reader = new FileReader();
        reader.onloadend = () => {
            switch(selectedLib) {
                case('face-api'):
                    faceApiSearch(e.target.elements, reader.result);
                break;
            }
        };
        reader.readAsDataURL(file);
    }

    const faceApiSearch = async (formFields, imageBlob) => {
        imgRefSearch.current.setAttribute('src', imageBlob);

        const results = await faceapi
        .detectAllFaces(imgRefSearch.current)
        .withFaceLandmarks()
        .withFaceDescriptors()

        const bestMatch = faceMatcher.findBestMatch(results[0].descriptor)
        console.log(bestMatch.toString())
    }
    
    return (
        <>
        <form style={{display: 'flex', flexDirection: 'column'}} onSubmit={(event) => registerParticipant(event)}>
            <input
            accept="image/*"
            id="image"
            name="image"
            multiple
            type="file"
            />
            <label htmlFor="image">
            <Button variant="raised" component="span">
                Upload
            </Button>
            </label> 
            <TextField
            id="name"
            name="name"
            label="Nome"
            defaultValue=""
            />
            <TextField
            id="outlined"
            label="CPF"
            defaultValue=""
            />
            <TextField
            id="outlined"
            label="E-mail"
            defaultValue=""
            />
            <Button type='submit'>Cadastrar</Button>
        </form>
        <img src="" ref={imgRef} />


        <form onSubmit={(event) => searchImg(event)}>
            <input
            accept="image/*"
            id="imageSearch"
            name="imageSearch"
            multiple
            type="file"
            />
            <label htmlFor="imageSearch">
                <Button variant="raised" component="span">
                    Upload
                </Button>
            </label>
            <Button type='submit'>
                Buscar
            </Button>
        </form>
        <img src="" ref={imgRefSearch} />

        </>
        )
    }