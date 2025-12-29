import { EventApi, EventInput } from "@fullcalendar/core";
import { AgendaItem } from "src/app/services/agenda.service";

let eventGuid = 0;
const TODAY_STR = new Date().toISOString().replace(/T.*$/, ""); // YYYY-MM-DD of today

// export const INITIAL_EVENTS: EventInput[] = [
//   {
//     id: createEventId(),
//     title: 'All-day event',
//     start: TODAY_STR
//   },
//   {
//     id: createEventId(),
//     title: 'Timed event',
//     start: TODAY_STR + 'T12:00:00'
//   }
// ];

export function createEventId() {
  return String(eventGuid++);
}

/***************************************************************************************************
/ Voeg de vakanties toe aan de kalender
/***************************************************************************************************/
export function addHolidaysToEvents(): EventInput[] {
  let holidays: EventInput[] = [];
  HOLIDAYS.forEach((element) => {
    let aHoliday: EventInput = new Object();
    aHoliday.title = element[0];
    aHoliday.start = element[1];
    aHoliday.end = element[2];
    aHoliday.display = "background";
    aHoliday.backgroundColor = "yellow";
    aHoliday.id = aHoliday.title + aHoliday.start;
    holidays.push(aHoliday);
  });
  console.log("holidays", holidays);
  return holidays;
}

export const HOLIDAYS = [
  ["kerst", "2025-12-20", "2026-01-04"],
  ["voorjaar", "2026-02-14", "2026-02-22"],
  ["mei", "2026-04-25", "2026-05-03"],
  ["zomer", "2026-07-18", "2026-08-30"],

  ["herfst", "2026-10-17", "2026-10-25"],
  ["kerst", "2026-12-19", "2027-01-03"],
  ["voorjaar", "2027-02-20", "2027-02-28"],
  ["mei", "2027-04-24", "2027-05-02"],
  ["zomer", "2027-07-17", "2027-08-29"],

  ["herfst", "2027-10-16", "2027-10-24"],
  ["kerst", "2027-12-25", "2028-01-09"],
  ["voorjaar", "2028-02-26", "2028-03-05" ],
  ["mei", "2028-04-29", "2028-05-07"],
  ["zomer", "2028-07-08", "2028-08-20" ],

  ["herfst", "2028-10-21", "2028-10-29"],
  ["kerst", "2028-12-23", "2029-01-07" ],
  ["voorjaar", "2029-02-17", "2029-02-25" ],
  ["mei", "2029-04-28", "2029-05-06" ],
  ["zomer", "2029-07-07", "2029-08-19"],
  
  ["herfst", "2029-10-20", "2029-10-28" ],
  ["kerst", "2029-12-22", "2030-01-06"],
  ["voorjaar", "2030-02-23", "2030-03-03" ],
  ["mei", "2030-04-27", "2030-05-05" ],
  ["zomer", "2030-07-13", "2030-08-25"],
 

];

/***************************************************************************************************
  / Transformeer een Agendaitem naar een event dat aan het Calendar object kan worden toegevoegd.
  / Het AngendaItem object zelf zit in de ExtendedProps
  /***************************************************************************************************/
export function agendaToEvent(agendaItem: AgendaItem): any {
  let event: any = new Object();
  event.title = agendaItem.EvenementNaam;

    event.allDay = true;
    event.date = agendaItem.Datum ;
  // const valid = !isNaN(Date.parse(agendaItem.Datum + 'T'+ agendaItem.Tijd));
  // if (valid) {
  //   event.allDay = false;
  //   event.date = agendaItem.Datum + 'T'+ agendaItem.Tijd;
  // } else {
  //   event.allDay = true;
  //   event.date = agendaItem.Datum ;
  // }

  // Als je start gebruikt dat krijg je een punt te zien met de begintijd. Als je het niet gebruikt dan
  // krijgen we een 'allDay' te zien. Dus een gekleurde achtergrond.
  //event.start = agendaItem.Datum + 'T'+ agendaItem.Tijd;
  // event.start = "10:00"
  event.id = agendaItem.Id;
  event.borderColor = setBorderColor(agendaItem.DoelGroep);
  event.backgroundColor = setBackgroundColor(agendaItem.Type, agendaItem.Organisatie)[0];
  event.textColor = setBackgroundColor(agendaItem.Type, agendaItem.Organisatie)[1];
  event.extendedProps = { agendaItem: agendaItem };
  return event;
}

export function setEventProps(eventApi: EventApi, agendaItem: AgendaItem): void {

  let newDate: Date;
  newDate = new Date(agendaItem.Datum);
  eventApi.setAllDay(true);
  // const valid = !isNaN(Date.parse(agendaItem.Datum + 'T'+ agendaItem.Tijd));
  // if (valid) {
  //   newDate = new Date(agendaItem.Datum + 'T'+ agendaItem.Tijd);
  //   eventApi.setAllDay(false);
  // } else {
  //   newDate = new Date(agendaItem.Datum);
  //   eventApi.setAllDay(true);
  // }

  eventApi.setExtendedProp("agendaItem", agendaItem);
  eventApi.setProp("title", agendaItem.EvenementNaam);
  eventApi.setProp("id", agendaItem.Id);
  eventApi.setProp("backgroundColor", setBackgroundColor(agendaItem.Type, agendaItem.Organisatie)[0]);
  eventApi.setProp("textColor", setBackgroundColor(agendaItem.Type, agendaItem.Organisatie)[1]);
  eventApi.setProp("borderColor", setBorderColor(agendaItem.DoelGroep));
}

function setBorderColor(doelGroep: string): string {
  switch (doelGroep) {
    case "J":
      return "black";
    default:
      return "orange";
  }
}

function setBackgroundColor(type: string, organiser: string): string[] {
  let boxcolor: string = "white";
  let textcolor: string = "black";

  if (type == 'V') {  // Vergadering
    boxcolor = 'white';
    if (organiser == '0') textcolor = "orange";
    if (organiser == '1') textcolor = "blue";
    if (organiser == '2') textcolor = "#fbc02d";
    if (organiser == '3') textcolor = "gray";
    return [boxcolor, textcolor];
  }

  if (type == 'A') {   // Action
    boxcolor = '#ff0000';
    if (organiser == '0') textcolor = "orange";
    if (organiser == '1') textcolor = "blue";
    if (organiser == '2') textcolor = "#fbc02d";
    if (organiser == '3') textcolor = "gray";
    return [boxcolor, textcolor];
  }

  if (type == 'C') {  // Comptitie
    boxcolor = 'green';
    textcolor = 'white'
    return [boxcolor, textcolor];
  }

  if (type == '') {
    boxcolor = 'white';
    textcolor = 'red'
    return [boxcolor, textcolor];
  }


  switch (organiser) {
    case "0":
      return ["orange", "white"];
    case "1":
      return ["blue", "white"];
    case "2":
      return ["yellow", "black"];
    case "3":
      return ["gray", "black"];
  }
  return [boxcolor, textcolor];
}
