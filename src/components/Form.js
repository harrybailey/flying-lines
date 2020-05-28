import React from 'react'
import XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

class Form extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: null,
            flights: [],
            startDate: new Date(), //setStartDate] = useState(new Date());
            endDate: new Date(), //const [endDate, setEndDate] = useState(new Date());
        }
    }

    handleFileChosen = (file) => {
        console.log('file chosen', file);

        let fileReader = new FileReader();
        fileReader.onload = this.handleFileRead;
        fileReader.readAsBinaryString(file);
    }


    getReadableHours = (o) => {
        return o.H.toString().padStart(2, '0') + ':' + o.M.toString().padStart(2, '0');
    }

    getDateObj = (o) => {
        return new Date(o.y, o.m-1, o.d);
    }

    getComparibleDate = (o) => {
        return o.y.toString() + o.m.toString().padStart(2, '0') + o.d.toString().padStart(2, '0');
    }

    handleFileRead = (evt) => {

       const bstr = evt.target.result;
        const wb = XLSX.read(bstr, {type:'binary'}); // cellText:false,cellDates:true,cellNF:true
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        // const data = XLSX.utils.sheet_to_csv(ws, {header:1});
        this.setState({data: XLSX.utils.sheet_to_json(ws, {
            // header: 1, // include header as first row?
            // raw: false,
            // dateNF:'yyyymmdd',
            sheets: ['FlightList']
        })});

    }


    handleFormSubmit = (evt) => {

        // const [flights, setFlights] = useState(0);

        const daysOfTheWeek = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthofTheYear = ['January','February','March','April','May','June','July','August','September','October','November','December']

        const dateRangeStart = {
            d: this.state.startDate.getDate(),
            m: this.state.startDate.getMonth()+1,
            y: this.state.startDate.getFullYear()
        };

        const dateRangeEnd = {
            d: this.state.endDate.getDate(),
            m: this.state.endDate.getMonth()+1,
            y: this.state.endDate.getFullYear()
        };

 

    console.log(dateRangeStart, dateRangeEnd);

        
        /* Update state */

        // console.log('Sheet names', wb.SheetNames);
        // console.log(data);

        this.setState({flights:[]});
        let flights = [];

        // for each flight info row
        for(var a = 0; a <= this.state.data.length; a++){

            if(typeof(this.state.data[a]) === 'undefined')
            {
                // console.log(data[a]);
                continue;
            }

            // check either location is valid
            if(this.state.data[a]['Dest'] === 'MAN' || this.state.data[a]['Orig'] === 'MAN'){

                let startDate = XLSX.SSF.parse_date_code(this.state.data[a]['Start']);
                let endDate = XLSX.SSF.parse_date_code(this.state.data[a]['End']);
                let arrivalTime = XLSX.SSF.parse_date_code(this.state.data[a]['STA (Loc)']);
                let departureTime = XLSX.SSF.parse_date_code(this.state.data[a]['STD (Loc)']);

                // console.log(getComparibleDate(startDate), getComparibleDate(endDate), getReadableHours(arrivalTime), getReadableHours(departureTime));

                if(this.getComparibleDate(startDate) <= this.getComparibleDate(dateRangeEnd) && this.getComparibleDate(endDate) >= this.getComparibleDate(dateRangeStart)){

                    // console.log('Winning', XLSX.SSF.parse_date_code(this.state.data[a]['Start']), XLSX.SSF.parse_date_code(this.state.data[a]['End']));

                    let current = this.getDateObj(dateRangeStart);
                    let ourEnd = this.getDateObj(dateRangeEnd);
                    let pattern = this.state.data[a]['Pattern'];
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
                            console.log('We fly on ' + daysOfTheWeek[current.getDay()], this.state.data[a]);

                            let flight = {
                                Al: this.state.data[a]['Al'],
                                flNo: this.state.data[a]['FlNo'].trim(),
                                Date: daysOfTheWeek[current.getDay()].substr(0,3) + ' ' + current.getDate().toString().padStart(2, '0') + '/' + monthofTheYear[current.getMonth()].substr(0, 3) + '/' + current.getFullYear(),
                                Orig: this.state.data[a]['Orig'],
                                'STD (Loc)': this.getReadableHours(departureTime),
                                'STA (Loc)': this.getReadableHours(arrivalTime),
                                Dest: this.state.data[a]['Dest'],
                                Own: this.state.data[a]['Own'],
                                'A/C': this.state.data[a]['A/C']
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
        this.setState({flights:flights});

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


    render() {

        return (
            <div>
                <div>Range Start: <DatePicker className="date-picker" selected={this.state.startDate} dateFormat="dd/MM/yyyy" onChange={date => this.setState({startDate:date})} /></div>
                <div>Range End: <DatePicker className="date-picker" selected={this.state.endDate} dateFormat="dd/MM/yyyy" onChange={date => this.setState({endDate:date})} /></div>
                <div><input type="file" className="file-input" id="schedule-xlsx" onChange={e => this.handleFileChosen(e.target.files[0])} /></div>
                <div><button className="generate-button" onClick={e => this.handleFormSubmit(e) }>Generate</button></div>
            </div>
        )
    }
}

export default Form;