import React from 'react';
import Form from './components/Form'
import './App.css';

function MainContainer()
{
    return (
        <div className="main-container">
            <h1 class="heading">Flying Lines</h1>
           <Form />
           <div class="guidance">
            <h2>Guidance</h2>
            <ol>
                <li>Select a start and end date for flying lines.</li>
                <li>Browse and select your schedule .xlsx file</li>
                <li>Click to generate a flying lines file for download</li>
            </ol>
            <p>File upload must contain the sheet 'FlightList' and the columns 'Al', 'FlNo', 'Dest', 'Orig', 'Start', 'End', 'STA (Loc)', 'STD (Loc)', 'Own', 'A/C' and 'Pattern'.</p>
            <p>Generated file will named 'flying-lines.xlsx' and contain a single 'Flying Lines' sheet with columns 'Al', 'FlNo', 'Date', 'Orig', 'STD (Loc)', 'STA (Loc)', 'Dest', 'Own', 'A/C'</p>
           </div>
        </div>
    );
}

export default MainContainer;