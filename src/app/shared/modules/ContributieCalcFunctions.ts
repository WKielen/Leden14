import { LedenItemExt, LidTypeValues, BetaalWijzeValues, LedenItem } from "src/app/services/leden.service";
import { BerekeningOverzicht } from "../classes/BerekeningOverzicht";
import { DirectDebit } from "../classes/DirectDebit";
import { formatDate } from "@angular/common";
import { ReplaceCharacters } from "./ReplaceCharacters";
import { MailItem, MailItemTo } from "src/app/services/mail.service";
import { BerekendeBedragen } from "../classes/BerekendeBedragen";
import { ContributieBedragen } from "../classes/ContributieBedragen";

/***************************************************************************************************
/ Contributie berekening nieuwe methode
/***************************************************************************************************/
export function BerekenContributie(lid: LedenItemExt, contributieBedragen: ContributieBedragen, description: string): BerekendeBedragen {

    let berekendeBedragen = new BerekendeBedragen();

    //* Contributie vrij
    if (lid.LidType == LidTypeValues.CONTRIBUTIEVRIJ) {   
        return berekendeBedragen;
    }

    //* Vast bedrag uit lid-record
    if (lid.VastBedrag > 0) {      
        berekendeBedragen.BasisContributie = lid.VastBedrag * 1;   // Om een of andere reden is vastbedrag een string, Door * 1 wordt het een number
        berekendeBedragen.EindBedrag = berekendeBedragen.BasisContributie;
        berekendeBedragen.Description = description;
        return berekendeBedragen;
    }

    //* Donateur
    if (lid.LidType == LidTypeValues.DONATEUR) {   
        berekendeBedragen.BasisContributie = contributieBedragen.Donateur;
        berekendeBedragen.EindBedrag = contributieBedragen.Donateur;
        berekendeBedragen.Description = description;
        return berekendeBedragen;
    }

    //* Donateur
    if (lid.LidType == LidTypeValues.PAKKET) {   
        berekendeBedragen.BasisContributie = contributieBedragen.Pakket;
        berekendeBedragen.EindBedrag = contributieBedragen.Pakket;
        berekendeBedragen.Description = description;
        return berekendeBedragen;
    }

    //* De normale contributie
    if (lid.LeeftijdCategorie == 'Volwassenen') {
        berekendeBedragen.BasisContributie = contributieBedragen.HalfjaarVolwassenen;
        if (String(lid.CompGerechtigd).toBoolean()) {
            berekendeBedragen.CompetitieBijdrage = contributieBedragen.CompetitieBijdrageVolwassenen;
        }
    } else {
        berekendeBedragen.BasisContributie = contributieBedragen.HalfjaarJeugd;
        if (String(lid.CompGerechtigd).toBoolean()) {
            berekendeBedragen.CompetitieBijdrage = contributieBedragen.CompetitieBijdrageJeugd;
        }
    }

    //* Zwerflid krijgt 50% korting op basiscontributie
    if (lid.LidType == LidTypeValues.ZWERFLID) {            
        berekendeBedragen.BasisContributie = Math.round(((berekendeBedragen.BasisContributie * contributieBedragen.ZwerflidPercentage / 100) + Number.EPSILON) * 100) / 100;
    }

    berekendeBedragen.Description = description;

    berekendeBedragen.EindBedrag =
        berekendeBedragen.BasisContributie +
        berekendeBedragen.CompetitieBijdrage;


    if (berekendeBedragen.BasisContributie == 0)
        console.log('Berekende bedragen', berekendeBedragen);




    return berekendeBedragen;

}


/***************************************************************************************************
/ Deze regel wordt gebruikt in het 'Maak berekenen overzicht'
/ Deze regel wordt er ook weggeschreven als csv
/***************************************************************************************************/
export function CreateDownloadReportDetailLine(lid: LedenItemExt, berekendeBedragen: BerekendeBedragen,
    contributieBedragen: ContributieBedragen): BerekeningOverzicht {
    let berekeningOverzicht = new BerekeningOverzicht();

    //* Lid gegevens
    berekeningOverzicht.LidNr = lid.LidNr;
    berekeningOverzicht.VolledigeNaam = lid.VolledigeNaam;
    berekeningOverzicht.LeeftijdCategorie = lid.LeeftijdCategorie;
    berekeningOverzicht.GeboorteDatum = lid.GeboorteDatum;
    berekeningOverzicht.LidType = LidTypeValues.GetLabel(lid.LidType);

    berekeningOverzicht.BetaalWijze = BetaalWijzeValues.GetLabel(lid.BetaalWijze);
    berekeningOverzicht.LidBond = lid.LidBond.toDutchTextString();
    berekeningOverzicht.CompGerechtigd = lid.CompGerechtigd.toDutchTextString();
    berekeningOverzicht.VastBedrag = lid.VastBedrag;

    //* Berekende bedragen
    berekeningOverzicht.BerekendeBasisContributie = berekendeBedragen.BasisContributie;
    berekeningOverzicht.BerekendeCompetitieBijdrage = berekendeBedragen.CompetitieBijdrage;
    berekeningOverzicht.BerekendeEindBedrag = berekendeBedragen.EindBedrag;
    berekeningOverzicht.Omschrijving = CreateDescriptionLine(berekendeBedragen.Description, lid.Voornaam);

    //* Gebruikte bedragen voor berekening 
    berekeningOverzicht.HalfjaarVolwassenen = contributieBedragen.HalfjaarVolwassenen;
    berekeningOverzicht.HalfjaarJeugd = contributieBedragen.HalfjaarJeugd;
    berekeningOverzicht.CompetitieBijdrageVolwassenen = contributieBedragen.CompetitieBijdrageVolwassenen;
    berekeningOverzicht.CompetitieBijdrageJeugd = contributieBedragen.CompetitieBijdrageJeugd;
    berekeningOverzicht.ZwerflidPercentage = contributieBedragen.ZwerflidPercentage;
    berekeningOverzicht.Donateur = contributieBedragen.Donateur;
    berekeningOverzicht.Pakket = contributieBedragen.Pakket;
    return berekeningOverzicht;
}

export function CreateDescriptionLine(description: string, name: string): string {
    return description + " - " + name;
}

/***************************************************************************************************
/ Create a list of Direct Debits.
/***************************************************************************************************/
export function CreateDirectDebits(ledenArray: Array<LedenItemExt>, contributieBedragen: ContributieBedragen, description: string): Array<DirectDebit> {

    let directDebits: DirectDebit[] = [];

    ledenArray.forEach((lid: LedenItemExt) => {
        if (lid.BetaalWijze != BetaalWijzeValues.INCASSO)
            return;

        let dd = CreateOneDirectDebit(lid, contributieBedragen, description);
        if (dd.Bedrag == 0)
            return;

        directDebits.push(dd);
    })

    return directDebits;
}

/***************************************************************************************************
/ Create one Direct Debit object for a lid and uses the fee amounts
/***************************************************************************************************/
export function CreateOneDirectDebit(lid: LedenItemExt, contributieBedragen: ContributieBedragen, description: string): DirectDebit {
    let directDebit = new DirectDebit();
    const berekendeBedragen: BerekendeBedragen = BerekenContributie(lid, contributieBedragen, description);

    directDebit.Bedrag = berekendeBedragen.EindBedrag;
    directDebit.NrMachtiging = lid.LidNr.toString();
    const lidVanaf: Date = new Date(lid.LidVanaf);
    const minMandateDate: Date = new Date('01 nov 2009');

    if (lidVanaf > minMandateDate) {
        directDebit.DatumMachtiging = formatDate(lid.LidVanaf, 'dd-MM-yyyy', 'nl');
    } else {
        directDebit.DatumMachtiging = formatDate(minMandateDate, 'dd-MM-yyyy', 'nl');
    }

    directDebit.BIC = '';
    directDebit.IBAN = lid.IBAN;
    directDebit.NaamDebiteur = ReplaceCharacters(lid.VolledigeNaam)
    directDebit.AdresRegel1 = ReplaceCharacters(lid.Adres);
    directDebit.AdresRegel2 = ReplaceCharacters(lid.Postcode.substring(0, 4) + " " + lid.Postcode.substring(4, 6) + "  " + lid.Woonplaats);
    directDebit.Omschrijving = ReplaceCharacters(CreateDescriptionLine(description, lid.Voornaam));

    return directDebit;
}

/***************************************************************************************************
/ Create overzicht for 'Zelfbetalers'or 'U-PAS'/NieuwegeinPas report
/***************************************************************************************************/
export function CreateBerekenOverzicht(ledenArray: Array<LedenItemExt>, contributieBedragen: ContributieBedragen, betaalWijze: string, description): Array<BerekeningOverzicht> {
    let berekeningOverzichten: Array<BerekeningOverzicht> = [];
    ledenArray.forEach((lid: LedenItemExt) => {
        if (betaalWijze == '' || lid.BetaalWijze == betaalWijze) {
            const berekendeBedragen: BerekendeBedragen = BerekenContributie(lid, contributieBedragen, description);
            if (berekendeBedragen.EindBedrag > 0) {
                berekeningOverzichten.push(CreateDownloadReportDetailLine(lid, berekendeBedragen, contributieBedragen));
            }
        }
    });
    return berekeningOverzichten;
}

/***************************************************************************************************
/ Create contributie mail
/***************************************************************************************************/
export function CreateContributieMail(lid: LedenItemExt, contributieBedragen: ContributieBedragen, description: string, requestedDirectDebitDate: string): MailItem {
    let mailItem = new MailItem;
    let string = '';

    const myMail:MailItemTo = LedenItem.GetEmailList(lid, true)[0];
    if (!myMail) {
      console.log('Letop: ', lid.VolledigeNaam,' heeft geen email adres waar ik de mail heen kan sturen');
      return null;
    }

    mailItem.To = myMail.To;
    mailItem.ToName = myMail.ToName;

    mailItem.Subject = "Aankondiging contributie TTVN - " + lid.Voornaam;
    if (lid.LeeftijdCategorieWithSex.substring(0, 1) == 'J') {
        string += ('Beste ouders/verzorgers van ' + lid.Voornaam + ',<br><br>');
    } else {
        string += ('Beste ' + lid.Voornaam + ',<br><br>');
    }
    switch (lid.BetaalWijze) {
        case BetaalWijzeValues.INCASSO:
            string += 'TTVN incasseert binnenkort halfjaarlijkse contributie. Deze mail bevat de gegevens met betrekking tot de incasso.';
            break;
        case BetaalWijzeValues.REKENING:
            string += 'TTVN heft binnenkort de halfjaarlijkse contributie. Deze mail betreft de vooraankondiging. Je krijgt de rekening in de zaal overhandigd.';
            string += 'Het rekeningnummer van TTVN is NL 84 RABO 0331 0652 66.';
            break;
        case BetaalWijzeValues.UPAS:
            string += 'TTVN heft binnenkort de halfjaarlijkse contributie. TTVN zal onderstaand bedrag bij de Nieuwegein pas of U-Pas in rekening brengen.';
        case BetaalWijzeValues.ZELFBETALER:
            string += 'Het is weer tijd voor de halfjaarlijkse contributie. Wil je onderstaand bedrag overmaken op de rekening van TTVN?';
            string += 'Het rekeningnummer van TTVN is NL 84 RABO 0331 0652 66.';
            break;
    }
    let berekendeBedragen = BerekenContributie(lid, contributieBedragen, description);

    string += '<br><table style="width:100%;text-align: left;">';
    string += '<tr><td style="width: 1px;white-space: nowrap;">Omschrijving</td><td>: ' + ReplaceCharacters(CreateDescriptionLine(description, lid.Voornaam)) + '</td></tr>';
    if (lid.BetaalWijze == BetaalWijzeValues.INCASSO) {
        string += '<tr><td style="width: 1px;white-space: nowrap;">IBAN</td><td>: ' + lid.IBAN + '</td></tr>';
        string += '<tr><td style="width: 1px;white-space: nowrap;">Verwachte incassodatum</td><td>: ' + requestedDirectDebitDate + '</td></tr>';
        string += '<tr><td style="width: 1px;white-space: nowrap;">Incasso referentie</td><td>: ' + lid.LidNr + '</td></tr>';
    }

    // console.log('berekend', berekendeBedragen);
    string += '<br>';
    if (berekendeBedragen.BasisContributie > 0) {
        string += '<tr><td style="width: 1px;white-space: nowrap;">Basiscontributie</td><td>: ' + berekendeBedragen.BasisContributie.AmountFormatHTML() + '</td></tr>';
    }
    if (berekendeBedragen.CompetitieBijdrage > 0) {
        string += '<tr><td style="width: 1px;white-space: nowrap;">Competitiebijdrage</td><td>: ' + berekendeBedragen.CompetitieBijdrage.AmountFormatHTML() + '</td></tr>';
    }
    string += '<tr><td style="width: 1px;white-space: nowrap;"></td><td>  ------------------</td></tr>';
    string += '<tr><td style="width: 1px;white-space: nowrap;">Totaal bedrag</td><td>: ' + berekendeBedragen.EindBedrag.AmountFormatHTML() + '</td></tr>';

    string += '</table>';
    mailItem.Message = string;
    return mailItem;
}

/*
Set focus to a Field

@ViewChild("name", {static: false}) nameField: ElementRef;
editName(): void {
  this.nameField.nativeElement.focus();
}
*/
