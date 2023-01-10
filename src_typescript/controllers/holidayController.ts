import { Request, Response } from "express";

import { PublicHoliday } from "../validation/interfaces";
import { getHolidaysSchema } from "../validation/holidayValidationSchema";

import toObj from "../config/responseStandart"

export enum StateCode {
    BadenWürttemberg      = "BW", 
    Bayern                = "BY", 
    Berlin                = "BE", 
    Brandenburg           = "BB",
    Bremen                = "HB", 
    Hamburg               = "HH", 
    Hessen                = "HE", 
    MecklenburgVorpommern = "MV", 
    Niedersachsen         = "NI", 
    NordrheinWestfalen    = "NW", 
    RheinlandPfalz        = "RP", 
    Saarland              = "SL",
    Sachsen               = "SN", 
    SachsenAnhalt         = "ST", 
    SchleswigHolstein     = "SH", 
    Thüringen             = "TH"
}

class HolidayController {

    private static cachedHolidayYears: Map<number, Map<StateCode, Array<PublicHoliday>>> = new Map<number, Map<StateCode, Array<PublicHoliday>>>();

    private static calculatePublicHolidays(year: number, stateCode: StateCode): Array<PublicHoliday> {
        
        console.log("Holiday Caching " + stateCode + " " + year.toString() + "...");

        const neuJahr: PublicHoliday            = {name: "Neujahr"                     ,date: new Date( Date.UTC(year, 0, 1))};
        const dreiKönige: PublicHoliday         = {name: "Heilige Drei Könige"         ,date: new Date( Date.UTC(year, 0, 6))};
        const intFrauenTag: PublicHoliday       = {name: "Internationaler Frauentag"   ,date: new Date( Date.UTC(year, 2, 8))};
        const tagDerArbeit: PublicHoliday       = {name: "Tag der Arbeit"              ,date: new Date( Date.UTC(year, 4, 1))};
        const mariaeHimmelfahrt : PublicHoliday = {name: "Mariä Himmelfahrt"           ,date: new Date( Date.UTC(year, 7, 15))};
        const weltKinderTag: PublicHoliday      = {name: "Weltkindertag"               ,date: new Date( Date.UTC(year, 8, 20))};
        const deutscheEinheit: PublicHoliday    = {name: "Tag der deutschen Einheit"   ,date: new Date( Date.UTC(year, 9, 3))};
        const reformationsTag: PublicHoliday    = {name: "Reformationstag"             ,date: new Date( Date.UTC(year, 9, 31))};
        const allerheiligen: PublicHoliday      = {name: "Allerheiligen"               ,date: new Date( Date.UTC(year, 10, 1))};
        const weihnachten1: PublicHoliday       = {name: "1. Weihnachtsfeiertag"       ,date: new Date( Date.UTC(year, 11, 25))};
        const weihnachten2: PublicHoliday       = {name: "2. Weihnachtsfeiertag"       ,date: new Date( Date.UTC(year, 11, 26))};

        //Spencers Osterformel
        const a = year % 19;
        const b = Math.trunc(year / 100);
        const c = year % 100;
        const d = Math.trunc(b / 4);
        const e = b % 4;
        const f = Math.trunc((b + 8) / 25);
        const g = Math.trunc((b - f + 1) / 3);
        const h = ((19*a) + b - d - g + 15) % 30;
        const i = Math.trunc(c / 4);
        const k = c % 4;
        const l = (32 + (2 * e) + (2 * i) - h - k) % 7;
        const m = Math.trunc((a + (11 * h) + (22 * l)) / 451);
        const month = Math.trunc((h + l - (7*m) + 114) / 31);
        const day   = ((h + l - (7*m) + 114) % 31) + 1;

        const karfreitag: PublicHoliday        = {name: "Karfreitag"           ,date: new Date( Date.UTC(year, month - 1, day - 2) )};
        const ostersonntag: PublicHoliday      = {name: "Ostersonntag"         ,date: new Date( Date.UTC(year, month - 1, day) )};
        const ostermontag: PublicHoliday       = {name: "Ostermontag"          ,date: new Date( Date.UTC(year, month - 1, day + 1) )};
        const himmelfahrt: PublicHoliday       = {name: "Christi Himmelfahrt"  ,date: new Date( Date.UTC(year, month - 1, day + 39) )};
        const pfingstsonntag: PublicHoliday    = {name: "Pfingstsonntag"       ,date: new Date( Date.UTC(year, month - 1, day + 49) )};
        const pfingstmontag: PublicHoliday     = {name: "Pfingstmontag"        ,date: new Date( Date.UTC(year, month - 1, day + 50) )};
        const fronleichnam: PublicHoliday      = {name: "Fronleichnam"         ,date: new Date( Date.UTC(year, month - 1, day + 60) )};
        
        let bussUndBettagDate: Date = new Date();

        //Buß- und Bettag
        for(let i = 16; i < 23; i++) {
            const date = new Date( Date.UTC(year, 10, i));

            if(date.getDay() == 3) {
                bussUndBettagDate = date;
                break;
            }
        } 

        const bussUndBettag: PublicHoliday = {name: "Buß- und Bettag", date: bussUndBettagDate};

        let holidayCache = new Array<PublicHoliday>()

        //Bundesweit
        holidayCache.push(neuJahr);
        holidayCache.push(karfreitag);
        holidayCache.push(ostermontag);
        holidayCache.push(tagDerArbeit);
        holidayCache.push(himmelfahrt);
        holidayCache.push(pfingstmontag);
        holidayCache.push(deutscheEinheit);
        holidayCache.push(weihnachten1);
        holidayCache.push(weihnachten2);

        //Heilige Drei Könige
        if(stateCode == StateCode.BadenWürttemberg || stateCode == StateCode.Bayern || stateCode == StateCode.SachsenAnhalt)
           holidayCache.push(dreiKönige);

        //Internationaler Frauentag
        if(stateCode == StateCode.Berlin)
            holidayCache.push(intFrauenTag);

        //Ostersonntag && Pfingstsonntag
        if(stateCode == StateCode.Brandenburg) {
            holidayCache.push(ostersonntag);
            holidayCache.push(pfingstsonntag);
        }

        //Fronleichnam
        if(stateCode == StateCode.BadenWürttemberg || 
           stateCode == StateCode.Bayern || 
           stateCode == StateCode.Hessen || 
           stateCode == StateCode.NordrheinWestfalen || 
           stateCode == StateCode.RheinlandPfalz || 
           stateCode == StateCode.Saarland) {
            holidayCache.push(fronleichnam);
        }

        //Mariä Himmelfahrt
        if(stateCode == StateCode.Saarland ||stateCode == StateCode.Bayern)
            holidayCache.push(mariaeHimmelfahrt);

        //Weltkindertag
        if(stateCode == StateCode.Thüringen)
            holidayCache.push(weltKinderTag);

        //Reformationstag
        if(stateCode == StateCode.Brandenburg ||
           stateCode == StateCode.Bremen ||
           stateCode == StateCode.Hamburg ||
           stateCode == StateCode.MecklenburgVorpommern ||
           stateCode == StateCode.Niedersachsen ||
           stateCode == StateCode.Sachsen ||
           stateCode == StateCode.SachsenAnhalt ||
           stateCode == StateCode.SchleswigHolstein ||
           stateCode == StateCode.Thüringen)
            holidayCache.push(reformationsTag);
        
        //Allerheiligen
        if(stateCode == StateCode.BadenWürttemberg ||
            stateCode == StateCode.Bayern ||
            stateCode == StateCode.NordrheinWestfalen ||
            stateCode == StateCode.RheinlandPfalz ||
            stateCode == StateCode.Saarland)
             holidayCache.push(allerheiligen);
            
        //Buß- und Bettag
        if(stateCode == StateCode.Sachsen)
             holidayCache.push(bussUndBettag);
        
        return holidayCache;
    }

    //GET returns holidays of a spacific state
    public static async getHolidays(request: Request, response: Response) {
        
        const requested_year = Number(request.params.year);
        const requested_state_code: StateCode = request.params.state_code as StateCode;

        const { error } = getHolidaysSchema.validate({year: requested_year, stateCode: requested_state_code});
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));

        const year: (Map<StateCode, Array<PublicHoliday>> | undefined) = HolidayController.cachedHolidayYears.get(requested_year);
        if(!year) {
            let newYear: Map<StateCode, Array<PublicHoliday>> = new Map<StateCode, Array<PublicHoliday>>();

            let holidays: Array<PublicHoliday> = HolidayController.calculatePublicHolidays(requested_year, requested_state_code)

            newYear.set(requested_state_code, holidays);
            HolidayController.cachedHolidayYears.set(requested_year, newYear);

            return response.status(200).json(toObj(response, {Holidays: holidays}));
        }

        const holidays: (Array<PublicHoliday> | undefined) = year.get(requested_state_code);
        if(!holidays) {
            let holidays: Array<PublicHoliday> = HolidayController.calculatePublicHolidays(requested_year, requested_state_code)
            year.set(requested_state_code, holidays);

            return response.status(200).json(toObj(response, {Holidays: holidays}));
        }

        return response.status(200).json(toObj(response, {Holidays: holidays}));
    }
}

export default HolidayController;