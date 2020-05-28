import React, {useState} from 'react';
// import logo from './logo.svg';
import './App.css';
import XLSX from 'xlsx';


let fileReader;
let flights = [];

const handleFileChosen = (file) => {
	console.log('file chosen', file);

	fileReader = new FileReader();
	fileReader.onload = handleFileRead;
	fileReader.readAsBinaryString(file);
}


const getReadableHours = (o) => {
	return o.H.toString().padStart(2, '0') + ':' + o.M.toString().padStart(2, '0');
}

const getReadableDate = (o) => {
	return o.d.toString().padStart(2, '0') + '/' + o.m.toString().padStart(2, '0') + '/' + o.y.toString();
}

const getDateObj = (o) => {
	return new Date(o.y, o.m-1, o.d);
}

const getComparibleDate = (o) => {
	return o.y.toString() + o.m.toString().padStart(2, '0') + o.d.toString().padStart(2, '0');
}

const handleFileRead = (evt) => {

	// const [flights, setFlights] = useState(0);

	const daysOfTheWeek = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const monthofTheYear = ['January','February','March','April','May','June','July','August','September','October','November','December']

	const dateRangeStart = {
		d: 22,
		m: 6,
		y: 2020
	};
	const dateRangeEnd = {
		d: 28,
		m: 6,
		y: 2020
	};

    const bstr = evt.target.result;
    const wb = XLSX.read(bstr, {type:'binary'}); // cellText:false,cellDates:true,cellNF:true
    /* Get first worksheet */
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    /* Convert array of arrays */
    // const data = XLSX.utils.sheet_to_csv(ws, {header:1});
    const data = XLSX.utils.sheet_to_json(ws, {
		// header: 1, // include header as first row?
		// raw: false,
		// dateNF:'yyyymmdd',
		sheets: ['FlightList']
	});
	
    /* Update state */

	// console.log('Sheet names', wb.SheetNames);
    // console.log(data);

	// for each flight info row
	for(var a = 0; a <= data.length; a++){

		if(typeof(data[a]) === 'undefined')
		{
			// console.log(data[a]);
			continue;
		}

		// check either location is valid
		if(data[a]['Dest'] === 'MAN' || data[a]['Orig'] === 'MAN'){

			let startDate = XLSX.SSF.parse_date_code(data[a]['Start']);
			let endDate = XLSX.SSF.parse_date_code(data[a]['End']);
			let arrivalTime = XLSX.SSF.parse_date_code(data[a]['STA (Loc)']);
			let departureTime = XLSX.SSF.parse_date_code(data[a]['STD (Loc)']);

			// console.log(getComparibleDate(startDate), getComparibleDate(endDate), getReadableHours(arrivalTime), getReadableHours(departureTime));

			if(getComparibleDate(startDate) <= getComparibleDate(dateRangeEnd) && getComparibleDate(endDate) >= getComparibleDate(dateRangeStart)){

				// console.log('Winning', XLSX.SSF.parse_date_code(data[a]['Start']), XLSX.SSF.parse_date_code(data[a]['End']));

				let current = getDateObj(dateRangeStart);
				let ourEnd = getDateObj(dateRangeEnd);
				let pattern = data[a]['Pattern'];
				pattern = pattern.substr(6,1) + pattern.substr(0,6);
				// console.log('pattern', pattern);
				let days = pattern.split('');

				while((current.getTime()) <= (ourEnd.getTime()))
				{
					// it's inside our range

					// Loop the flight days to check each as we increment
					// Check the current date is a M,T,W,T,F,S,S and it's enabled

					if(days[current.getDay()] !== '.'){

						// we fly today!
						console.log('We fly on ' + daysOfTheWeek[current.getDay()], data[a]);

						let flight = {
							Al: data[a]['Al'],
							flNo: data[a]['FlNo'].trim(),
							Date: daysOfTheWeek[current.getDay()].substr(0,3) + ' ' + current.getDate().toString().padStart(2, '0') + '/' + monthofTheYear[current.getMonth()].substr(0, 3) + '/' + current.getFullYear(),
							Orig: data[a]['Orig'],
							'STD (Loc)': getReadableHours(departureTime),
							'STA (Loc)': getReadableHours(arrivalTime),
							Dest: data[a]['Dest'],
							Own: data[a]['Own'],
							'A/C': data[a]['A/C']
						};

						flights.push(flight);

					}

					current.setDate(current.getDate() + 1);
				}
			}
		}
	}

	// setFlights(flights);
	// console.table(flights);

	if(1){
	
		/* make the worksheet */
		let ws2 = XLSX.utils.json_to_sheet(flights);

		/* add to workbook */
		let wb2 = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb2, ws2, "Flying Lines");

		/* generate an XLSX file */
		XLSX.writeFile(wb2, "flying-lines.xlsx");
	}
}

function App() {

	return (
		<div className="App">
			<input type="file" className="file-input" id="schedule-xlsx" onChange={e => handleFileChosen(e.target.files[0])} />
		</div>
	);
}

export default App;
