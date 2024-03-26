import { EventApi, EventInput } from "@fullcalendar/angular";
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

  ["herfst", "2021-10-16", "2021-10-25"],
  ["kerst", "2021-12-25", "2022-01-10"],
  ["voorjaar", "2022-02-26", "2022-03-07"],
  ["mei", "2022-04-30", "2022-05-09"],
  ["zomer", "2022-07-09", "2022-08-22"],

  ["herfst", "2022-10-22", "2022-10-31"],
  ["kerst", "2022-12-24", "2023-01-09"],
  ["voorjaar", "2023-02-25", "2023-03-06"],
  ["mei", "2023-04-29", "2023-05-08"],
  ["zomer", "2023-07-08", "2023-08-21"],

  ["herfst", "2023-10-14", "2023-10-23"],
  ["kerst", "2023-12-23", "2024-01-08"],
  ["voorjaar", "2024-02-17", "2024-02-25"],
  ["mei", "2024-04-27", "2024-05-06"],
  ["zomer", "2024-07-13", "2024-08-26"],
];

/***************************************************************************************************
  / Transformeer een Agendaitem naar een event dat aan het Calendar object kan worden toegevoegd.
  / Het AngendaItem object zelf zit in de ExtendedProps
  /***************************************************************************************************/
export function agendaToEvent(agendaItem: AgendaItem): any {
  let event: any = new Object();
  event.title = agendaItem.EvenementNaam;

  const valid = !isNaN(Date.parse(agendaItem.Datum + 'T'+ agendaItem.Tijd));
  if (valid) {
    event.allDay = false;
    event.date = agendaItem.Datum + 'T'+ agendaItem.Tijd;
  } else {
    event.allDay = true;
    event.date = agendaItem.Datum ;
  }

  // Als je start gebruikt dat krijg je een punt te zien met de begintijd. Als je het niet gebruikt dan
  // krijgen we een 'allDay' te zien. Dus een gekleurde achtergrond.
  //event.start = agendaItem.Datum + 'T'+ agendaItem.Tijd;
  // event.start = "10:00"
  event.id = agendaItem.Id;
  event.borderColor = setBorderColor(agendaItem.DoelGroep);
  event.backgroundColor = setBackgroundColor(agendaItem.Type, agendaItem.Extra1)[0];
  event.textColor = setBackgroundColor(agendaItem.Type, agendaItem.Extra1)[1];
  event.extendedProps = { agendaItem: agendaItem };
  return event;
}

export function setEventProps(eventApi: EventApi, agendaItem: AgendaItem): void {

  let newDate: Date;
  const valid = !isNaN(Date.parse(agendaItem.Datum + 'T'+ agendaItem.Tijd));
  if (valid) {
    newDate = new Date(agendaItem.Datum + 'T'+ agendaItem.Tijd);
    eventApi.setAllDay(false);
  } else {
    newDate = new Date(agendaItem.Datum);
    eventApi.setAllDay(true);
  }

  eventApi.setExtendedProp("agendaItem", agendaItem);
  eventApi.setProp("title", agendaItem.EvenementNaam);
  eventApi.setProp("id", agendaItem.Id);
  eventApi.setProp("backgroundColor", setBackgroundColor(agendaItem.Type, agendaItem.Extra1)[0]);
  eventApi.setProp("textColor", setBackgroundColor(agendaItem.Type, agendaItem.Extra1)[1]);
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

  if (type == 'V') {
    boxcolor = 'white';
    if (organiser == '0') textcolor = "orange";
    if (organiser == '1') textcolor = "blue";
    if (organiser == '2') textcolor = "#fbc02d";
    if (organiser == '3') textcolor = "gray";
    return [boxcolor, textcolor];
  }

  if (type == 'A') {
    boxcolor = '#ff0000';
    if (organiser == '0') textcolor = "orange";
    if (organiser == '1') textcolor = "blue";
    if (organiser == '2') textcolor = "#fbc02d";
    if (organiser == '3') textcolor = "gray";
    return [boxcolor, textcolor];
  }

  if (type == 'C') {
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
