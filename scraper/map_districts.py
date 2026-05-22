DISTRICT_TO_REGION: dict[str, str] = {
    # Central
    "Kampala": "Central", "Wakiso": "Central", "Mukono": "Central",
    "Luwero": "Central", "Masaka": "Central", "Kalangala": "Central",
    "Kiboga": "Central", "Mubende": "Central", "Mityana": "Central",
    "Nakaseke": "Central", "Nakasongola": "Central", "Buikwe": "Central",
    "Buvuma": "Central", "Gomba": "Central", "Kalungu": "Central",
    "Kyankwanzi": "Central", "Lwengo": "Central", "Lyantonde": "Central",
    "Mpigi": "Central", "Rakai": "Central", "Sembabule": "Central",
    # Eastern
    "Jinja": "Eastern", "Mbale": "Eastern", "Tororo": "Eastern",
    "Iganga": "Eastern", "Soroti": "Eastern", "Kumi": "Eastern",
    "Kapchorwa": "Eastern", "Pallisa": "Eastern", "Kamuli": "Eastern",
    "Bugiri": "Eastern", "Mayuge": "Eastern", "Sironko": "Eastern",
    "Busia": "Eastern", "Budaka": "Eastern", "Bududa": "Eastern",
    "Bukedea": "Eastern", "Butaleja": "Eastern", "Buyende": "Eastern",
    "Kaliro": "Eastern", "Kibuku": "Eastern", "Luuka": "Eastern",
    "Manafwa": "Eastern", "Namayingo": "Eastern", "Namutumba": "Eastern",
    "Ngora": "Eastern", "Serere": "Eastern", "Butebo": "Eastern",
    "Namisindwa": "Eastern",
    # Northern
    "Gulu": "Northern", "Lira": "Northern", "Arua": "Northern",
    "Kitgum": "Northern", "Apac": "Northern", "Moroto": "Northern",
    "Kotido": "Northern", "Nebbi": "Northern", "Adjumani": "Northern",
    "Moyo": "Northern", "Pader": "Northern", "Amuria": "Northern",
    "Nakapiripirit": "Northern", "Abim": "Northern", "Amolatar": "Northern",
    "Amuru": "Northern", "Dokolo": "Northern", "Kaabong": "Northern",
    "Koboko": "Northern", "Maracha": "Northern", "Oyam": "Northern",
    "Agago": "Northern", "Alebtong": "Northern", "Amudat": "Northern",
    "Kole": "Northern", "Lamwo": "Northern", "Napak": "Northern",
    "Nwoya": "Northern", "Otuke": "Northern", "Zombo": "Northern",
    # Western
    "Mbarara": "Western", "Kabale": "Western", "Kasese": "Western",
    "Fort Portal": "Western", "Bushenyi": "Western", "Hoima": "Western",
    "Masindi": "Western", "Rukungiri": "Western", "Ntungamo": "Western",
    "Kibaale": "Western", "Kyenjojo": "Western", "Kamwenge": "Western",
    "Kabarole": "Western", "Kanungu": "Western", "Kiruhura": "Western",
    "Isingiro": "Western", "Kiryandongo": "Western", "Buliisa": "Western",
    "Buhweju": "Western", "Ibanda": "Western", "Kagadi": "Western",
    "Kakumiro": "Western", "Mitooma": "Western", "Rubanda": "Western",
    "Rubirizi": "Western", "Rwampara": "Western", "Sheema": "Western",
}


def get_region(district: str) -> str:
    """Return region for a district name, or 'Central' as fallback."""
    return DISTRICT_TO_REGION.get(district, "Central")
