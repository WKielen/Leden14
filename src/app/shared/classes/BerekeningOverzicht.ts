/***************************************************************************************************
/ In deze class sla ik per lid alle berekende bedragen op en alle params die zijn gebruikt.
/ Dit wordt gebruikt voor het download overzicht. Ieder property wordt een kolom in de CSV
/***************************************************************************************************/
export class BerekeningOverzicht {

    LidNr: number = 0;
    VolledigeNaam: string = '';
    LeeftijdCategorie: string = '';
    GeboorteDatum?: string = '';
    BetaalWijze?: string = '';
    LidBond?: string = '';
    CompGerechtigd?: string = '';
    LidType?: string = '';
    VastBedrag?: number = 0;

    BerekendeBasisContributie: number = 0;
    BerekendeCompetitieBijdrage: number = 0;
    BerekendeEindBedrag: number = 0;
    Omschrijving: string = '';

    HalfjaarVolwassenen: number = 0;
    HalfjaarJeugd: number = 0;
    CompetitieBijdrageVolwassenen: number = 0;
    CompetitieBijdrageJeugd: number = 0;
    ZwerflidPercentage: number = 0;
    Donateur: number = 0;
    Pakket: number = 0;
}