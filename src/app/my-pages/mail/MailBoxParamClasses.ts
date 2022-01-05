/***************************************************************************************************
/ De classes worden gebruikt om de voorbeeld mails en de mailbox params op te slaan in de param tabel
/***************************************************************************************************/

export class MailBoxParam {
  UserId: string = '';
  Password: string = '';
  Name: string = '';
}

export class MailNameList {
  MailNameItems: string[] = [];
}

export class MailSaveItem {
  Name: string;
  Subject: string;
  Message: string;
}
