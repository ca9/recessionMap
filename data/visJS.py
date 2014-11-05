'''
	*** FINAL FORMAT ***
	{
		"IND":{
			"code2":"IN",
	        "code3":"IND",
	        "official_name":"Republic of India",
	        "neighbours":["AFG","BGD","BTN","MMR","CHN","NPL","PAK","LKA"],
	        "capital":"New Delhi",
	        "common_name":"India",
	        "continent":"Asia",
	        "economy": {
	        	"2000": {
	        		"TX.VAL.MRCH.R4.ZS.":0.02,
                	"NE.CON.PRVT.KD.ZG.":5.91
	        	}
	        }
		}
	}
'''
import json
from pprint import pprint
country_to_continent = {"DZA": "Africa", "LIE": "Europe", "EGY": "Africa", "BGD": "Asia", "QAT": "Asia", "NAM": "Africa", "BGR": "Europe", "BOL": "South America", "GHA": "Africa", "CCK": "Asia", "PAK": "Asia", "WLF": "Oceania", "JOR": "Asia", "LBR": "Africa", "LBY": "Africa", "VNM": "Asia", "ATA": "Antarctica", "PRI": "North America", "SXM": "North America", "PRK": "Asia", "TZA": "Africa", "PRT": "Europe", "SPM": "North America", "UMI": "Oceania", "TTO": "North America", "PRY": "South America", "HKG": "Asia", "SAU": "Asia", "NLD": "Europe", "SVN": "Europe", "BFA": "Africa", "CHE": "Europe", "MRT": "Africa", "CPV": "Africa", "HRV": "Europe", "CHL": "South America", "CHN": "Asia", "KNA": "North America", "JAM": "North America", "SMR": "Europe", "GIB": "Europe", "DJI": "Africa", "GIN": "Africa", "FIN": "Europe", "URY": "South America", "THA": "Asia", "SYC": "Africa", "NPL": "Asia", "CXR": "Asia", "MAR": "Africa", "YEM": "Asia", "DEU": "Europe", "PHL": "Asia", "ZAF": "Africa", "NIC": "North America", "BVT": "Antarctica", "IRL": "Europe", "MNE": "Europe", "VIR": "North America", "SYR": "Asia", "MAC": "Asia", "MAF": "North America", "KAZ": "Asia", "TCA": "North America", "PYF": "Oceania", "NIU": "Oceania", "CUW": "North America", "DMA": "North America", "ARE": "Asia", "BEN": "Africa", "GUF": "South America", "BEL": "Europe", "TGO": "Africa", "ZWE": "Africa", "GUM": "Oceania", "LKA": "Asia", "FLK": "South America", "PCN": "Oceania", "BES": "North America", "GUY": "South America", "MMR": "Asia", "COK": "Oceania", "MNP": "Oceania", "COM": "Africa", "TKL": "Oceania", "TKM": "Asia", "SUR": "South America", "PAN": "North America", "BMU": "North America", "HMD": "Antarctica", "TCD": "Africa", "GEO": "Asia", "ROU": "Europe", "MNG": "Asia", "MHL": "Oceania", "MTQ": "North America", "BLZ": "North America", "NFK": "Oceania", "SWE": "Europe", "AFG": "Asia", "BDI": "Africa", "VGB": "North America", "BLR": "Europe", "BLM": "North America", "GRD": "North America", "ALA": "Europe", "GRC": "Europe", "RUS": "Europe", "GRL": "North America", "SHN": "Africa", "AND": "Europe", "RWA": "Africa", "ARG": "South America", "TJK": "Asia", "HTI": "North America", "PSE": "Asia", "LCA": "North America", "IND": "Asia", "SSD": "Africa", "BTN": "Asia", "VCT": "North America", "MYS": "Asia", "NOR": "Europe", "CZE": "Europe", "ATF": "Antarctica", "ATG": "North America", "FJI": "Oceania", "IOT": "Asia", "HND": "North America", "MUS": "Africa", "DOM": "North America", "LUX": "Europe", "ISR": "Asia", "FSM": "Oceania", "PER": "South America", "REU": "Africa", "IDN": "Asia", "VUT": "Oceania", "MKD": "Europe", "CRI": "North America", "COD": "Africa", "COG": "Africa", "ISL": "Europe", "GLP": "North America", "ETH": "Africa", "NER": "Africa", "COL": "South America", "NGA": "Africa", "TWN": "Asia", "BWA": "Africa", "MDA": "Europe", "GGY": "Europe", "MDG": "Africa", "ECU": "South America", "KIR": "Oceania", "SEN": "Africa", "NZL": "Oceania", "MDV": "Asia", "ASM": "Oceania", "KHM": "Asia", "TLS": "Asia", "FRA": "Europe", "LTU": "Europe", "UGA": "Africa", "ZMB": "Africa", "GMB": "Africa", "JEY": "Europe", "FRO": "Europe", "GTM": "North America", "DNK": "Europe", "IMN": "Europe", "AUS": "Oceania", "CUB": "North America", "SJM": "Europe", "VEN": "South America", "PLW": "Oceania", "KEN": "Africa", "LAO": "Asia", "MEX": "North America", "TUR": "Asia", "ALB": "Europe", "OMN": "Asia", "TUV": "Oceania", "ITA": "Europe", "BRN": "Asia", "TUN": "Africa", "GBR": "Europe", "LBN": "Asia", "BRB": "North America", "BRA": "South America", "CAN": "North America", "SRB": "Europe", "GNQ": "Africa", "USA": "North America", "AGO": "Africa", "IRN": "Asia", "MOZ": "Africa", "WSM": "Oceania", "MSR": "North America", "GNB": "Africa", "SWZ": "Africa", "TON": "Oceania", "CIV": "Africa", "UKR": "Europe", "KOR": "Asia", "MYT": "Africa", "ERI": "Africa", "SVK": "Europe", "CYP": "Asia", "BIH": "Europe", "SGP": "Asia", "SGS": "Antarctica", "SOM": "Africa", "UZB": "Asia", "CMR": "Africa", "AZE": "Asia", "POL": "Europe", "KWT": "Asia", "AIA": "North America", "GAB": "Africa", "CYM": "North America", "VAT": "Europe", "EST": "Europe", "LVA": "Europe", "MWI": "Africa", "ESP": "Europe", "IRQ": "Asia", "SLV": "North America", "MLI": "Africa", "STP": "Africa", "MLT": "Europe", "ABW": "North America", "SLE": "Africa", "SDN": "Africa", "SLB": "Oceania", "ESH": "Africa", "MCO": "Europe", "JPN": "Asia", "KGZ": "Asia", "ARM": "Asia", "NCL": "Oceania", "NRU": "Oceania", "LSO": "Africa", "CAF": "Africa", "BHS": "North America", "BHR": "Asia", "HUN": "Europe", "PNG": "Oceania", "AUT": "Europe"}


'''
	prune countries.json and keep only the required attributes
	common_name, official_name, code2, code3, neighbours, continent
'''
def parse_countries_json(input = "countries.json", continents = "countries_to_continent.json"):
	countries_fp = open(input)
	countries = json.load(countries_fp)
	countries_fp.close()

	# country_to_continent = {}
	# with open(continents, 'rt') as file:
	# 	for line in file:
	# 		country = json.loads(line.strip()[:-1])
	# 		country_to_continent[country['a3']] = country['continent_name']

	# with open('continents.json', 'wb') as fp:
 	# 	json.dump(country_to_continent, fp)
  	
  	pruned = {}
	for country in countries:
		country_dict = {}
		country_dict["common_name"] = country["name"]["common"]
		country_dict["official_name"] = country["name"]["official"]
		country_dict["capital"] = country["capital"]
		country_dict["code2"] = country["cca2"]
		country_dict["code3"] = country["cca3"]
		country_dict["neighbours"] = country["borders"]
		try:
			country_dict["continent"] = country_to_continent[country["cca3"]]
		except KeyError:
			print "Could'nt find continent for: ", country["cca3"]
			continue

		pruned[country["cca3"]] = country_dict
	return pruned

if __name__ == "__main__":
	countries = parse_countries_json()

	# now load the data from final_data.json and append to countries{} as year wise economies
	data_fp = open("final_data.json")
	data = json.load(data_fp)
	data_fp.close()

	skip_these = ["Country.Code2", "Country.Code", "Country.Name", "Time"]
	final_data = {}
	for entry, props in data.iteritems():
		country_year = props["Time"]
		country_code = props["Country.Code"]

		if country_code not in final_data:
			try:
				final_data[country_code] = countries[country_code]
				final_data[country_code]["economy"] = {}
			except KeyError:
				continue

		year_data = {}
		for k, v in props.iteritems():
			if k not in skip_these:
				year_data[k] = v

		final_data[country_code]["economy"][country_year] = year_data

	with open('SPARTA.json', 'wb') as fp:
		json.dump(final_data, fp, indent=4, separators=(',', ':'))
		# use this to make a lighter, single-line json
		# json.dump(final_data, fp)

	continents = {}
	for k, v in final_data.iteritems():
		if v["continent"] not in continents:
			continents[v["continent"]] = []
		continents[v["continent"]].append(k)

	with open('continents.json', 'wb') as fp:
		# json.dump(final_data, fp, indent=4, separators=(',', ':'))
		# use this to make a lighter, single-line json
		json.dump(continents, fp)