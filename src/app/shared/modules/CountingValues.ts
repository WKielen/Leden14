/***************************************************************************************************
/ Wordt gebruik voor het tellen van de leden per categorie
/***************************************************************************************************/
import { Dictionary } from "./Dictionary";

export class CountingValues extends Dictionary {

    public Increment(key: string): void {
        if (this.containsKey(key)) {
            this.set(key, this.get(key) + 1) 
        } else {
            this.add(key, 1);
        }
    }

    public Decrement(key: string): void {
        if (this.containsKey(key)) {
            this.set(key, this.get(key) - 1) 
        } else {
            this.add(key, 1);
        }
    }

}
