import React from 'react';
import {createRoot} from 'react-dom/client';
import SafetyHostPanel from '../src/components/safety/SafetyHostPanel';
createRoot(document.getElementById('root')).render(<SafetyHostPanel sessionLabel="Fictional session"/>);
