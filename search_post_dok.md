POST Search
https://test-v2.obs.md/api/v2/search
Search endpoint
[POST] /api/v2/search

The Client can retrieve all offers for specific destination. Offers are sorted from the cheapest one first.

Request

Parameters	Required	value or format	description
country	yes	2 letter country ISO code	Country code
airport_city_from	yes	int	Departure airport city
package_template	yes	int	Package template id
airport_city_to	yes/no	array	Arrival airport city, required if package template contains service "avia_transport"
date_from	yes	string YYYY-mm-DD	Start of ckeck_in
date_to	yes	string YYYY-mm-DD	End of ckeck_in
nights_from	yes	int	Number of nights in hotel
nights_to	no	int default = nights_from	If empty is equal with nights_from
adults	yes	int	count of adults(>=18 years)
children	no	int	count of children(<18 years)
children_age	no	array	ex. [0.01, 2, 17]
selected_hotels	yes	array	Array of searchable hotels
meals	no	array	Array of searchable meals
options	no	array	Array of available options
price_from	no	float	filter results by min price
price_to	no	float	filter results by max price
Available options

key	description
night	get results only with Night flights
day	get results only with Day flights
hotel_in_stop	get only "active" hotels
Response
Key	Type	Description
hotel_results_counter	int	Total number of additional results available for this offer combination
package_template	int	Package template ID used for book this offer combination
operator	int	ID of operator
additional_services	array	List of additional services included in this offer
dates	array	List of check-in and check-out dates to Hotel
nights	array	List of total nights in Hotel and on the way Hotel
accommodation	array	Data about accommodation in the Hotel
tickets	array	Data about departure and arrival flights
transfers	array	List of transfers to hotel and from hotel
price	array	List of prices and commissions available for this offer
never_land_entrance	array	List of ids included "NeverLand night show" entrance for this offer
gala_dinner	array	List of ids included "Gala dinners" for this offer
aquapark_services	array	List of ids included "Aquapark entrances" for this offer
tourists	array	List of tourists ages available for accommodation in this offer
Response/dates
Key	Type	Format	Description
check_in	date	YYYY-MM-DD	Date of check_in in Hotel
check_out	date	YYYY-MM-DD	Date of check_out from Hotel
Response/nights
Key	Type	Description
total	int	Total number of stay nights in Hotel (difference between check-out and check-in)
on_the_way	int	Total number of nights on the way to Hotel (difference between takeoff and check_in)
Response/accommodation
Key	Type	Description
hotel	array	Data about hotel (name, category, location)
room	array	Data about room
placement	array	Data about placement in this room
meal	array	Data about meal in this offer
Response/accommodation/hotel
Key	Type	Description
id	int	ID of the Hotel
name	string	Name of the Hotel
is_exclusive	bool	Is this Hotel special or not
category	string	Number of stars of the Hotel
city	string	City (location) of the Hotel
in_stop	bool	Is this combination in STOP SALE or not
Response/accommodation/room
Key	Type	Description
id	int	ID of the Room
name	string	Name of the Room
Response/accommodation/placement
Key	Type	Description
id	int	ID of Placement for this room
name	string	Name of Placement
Response/accommodation/meal
Key	Type	Description
id	int	ID of meal for this offer
name	string	Short name (abbreviation) of meal
full_name	string	Full name of meal
Response/tickets
Key	Type	Description
from	array	Data about departure flight
to	array	Data about arrival flight
on_request	enum (y, n)	Tickets on request, if y = tickets will need manual confirm, if n - tickets will be autoconfirmed
has_tickets	bool	Has remained tickets for this offer
Response/tickets/from
Key	Type	Description
id	int	Departure flight ID
name	string	Departure Flight Number
airline	array	Airline of the departure Flight
departure	array	Date and time of takeoff
arrival	array	Date and time of landing
airports	array	Takeof and landing Airports
tickets	int (nullable)	Number of available tickets 0-10 or empty if more than 10
Response/tickets/from/airline
Key	Type	Description
iata_code	string	Airline IATA code
color	string	Color of the airline
airline	string	Name of the airline
Response/tickets/from/departure
Key	Type	Format	Description
date	date	YYYY-MM-DD	Date of takeof
time	time	HH:II	Time of takeof
Response/tickets/from/arrival
Key	Type	Format	Description
date	date	YYYY-MM-DD	Date of landing
time	time	HH:II	Time of landing
Response/tickets/from/airports
Key	Type	Description
from	array	Airport of takeof information
to	array	Airport of landing information
Response/tickets/from/airports/from
Key	Type	Description
name	string	Airport full name
prefix	string	Airport IATA code
Response/tickets/from/airports/to
Key	Type	Description
name	string	Airport full name
prefix	string	Airport IATA code
Response/tickets/to
Key	Type	Description
id	int	Arrival flight ID
name	string	Arrival
airline	array	Airline of the arrival Flight
departure	array	Date and time of takeoff
arrival	array	Date and time of landing
airports	array	Takeof and landing Airports
tickets	int (nullable)	Number of available tickets 0-10 or empty if more than 10
Response/tickets/to/airline
Key	Type	Description
iata_code	string	Airline IATA code
color	string	Color of the airline
airline	string	Name of the airline
Response/tickets/to/departure
Key	Type	Format	Description
date	date	YYYY-MM-DD	Date of takeof
time	time	HH:II	Time of takeof
Response/tickets/to/arrival
Key	Type	Format	Description
date	date	YYYY-MM-DD	Date of landing
time	time	HH:II	Time of landing
Response/tickets/to/airports
Key	Type	Description
from	array	Airport of takeof information
to	array	Airport of landing information
Response/tickets/to/airports/from
Key	Type	Description
name	string	Airport full name
prefix	string	Airport IATA code
Response/tickets/to/airports/to
Key	Type	Description
name	string	Airport full name
prefix	string	Airport IATA code
Response/transfers
Key	Type	Description
to	int	ID of transfer to Hotel
from	int	ID of transfer from Hotel
Response/price
Key	Type	Description
amount	float	Gross price
netto	float	Net price
commission	float	Commission sum (gros - net)
type	string	Type of offer (early booking, standard, special offer)
currency	string	Offer Currency CODE (EUR, US)
currency_id	int	Offer currency ID
Response/tourists
Key	Type	Description
adults	int	Total ad (18+)
children_ages	array	List of ages of tourists under 18 y.o.
Headers
Accept
application/json
Content-Type
application/json
Authorization
Bearer {access_token}
Body json
{
  "country": 223,
  "package_template": 53,
  "airport_city_from": 33785,
  "airport_city_to": [
    50004
  ],
  "date_from": "01.08.2022",
  "date_to": "14.08.2022",
  "nights_from": 7,
  "nights_to": 7,
  "adults": 2,
  "selected_hotels": [
    6428,
    62,
    582
  ],
  "meals": [
    "AI and better",
    "HB",
    "RB"
  ]
}

Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/search")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Accept"] = "application/json"
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer {access_token}"
request.body = "{\n\t\"country\": 223,\n\t\"package_template\": 53,\n\t\"airport_city_from\": 33785,\n\t\"airport_city_to\": [\n\t\t50004\n\t],\n\t\"date_from\": \"01.08.2022\",\n\t\"date_to\": \"14.08.2022\",\n\t\"nights_from\": 7,\n\t\"nights_to\": 7,\n\t\"adults\": 2,\n\t\"selected_hotels\": [\n\t\t6428,\n\t\t62,\n\t\t582\n\t],\n\t\"meals\": [\"AI and better\", \"HB\", \"RB\"]\n}"

response = http.request(request)
puts response.read_body
Example response - 200:
{
	"2022-07-21:7:26:697_700": {
		"unique_key": "MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz",
		"rid": "JGANNj0E5iQKayhP",
		"hotel_results_counter": 2,
		"package_template": 53,
		"operator": 2,
		"additional_services": [],
		"dates": {
			"check_in": "2022-07-21",
			"check_out": "2022-07-28"
		},
		"nights": {
			"total": 7,
			"on_the_way": 0
		},
		"accommodation": {
			"hotel": {
				"id": 26,
				"name": "ADALYA ARTSIDE HOTEL",
				"is_exclusive": false,
				"category": "5* \/ HV1",
				"city": "SIDE",
				"in_stop": true
			},
			"room": {
				"id": 6,
				"name": "STANDARD ROOM LAND VIEW"
			},
			"placement": {
				"id": 2769,
				"name": "2AD"
			},
			"meal": {
				"id": 3,
				"name": "UAI",
				"full_name": "ULTRA ALL INCLUSIVE"
			}
		},
		"price": {
			"amount": 1712,
			"netto": 1600,
			"commission": 112,
			"type": "EB până la 31.07",
			"currency": "EUR",
			"currency_id": 1
		},
		"tickets": {
			"from": {
				"id": 697,
				"name": " 580",
				"airline": {
					"iata_code": "4D",
					"color": "#7283EB",
					"airline": "AERRO DIREKT"
				},
				"departure": {
					"date": "2022-07-21",
					"time": "12:30"
				},
				"arrival": {
					"date": "2022-07-21",
					"time": "14:20"
				},
				"airports": {
					"from": {
						"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
						"prefix": "OTP"
					},
					"to": {
						"name": "ANTALYA AIRPORT",
						"prefix": "AYT"
					}
				},
				"tickets": ""
			},
			"to": {
				"id": 700,
				"name": " 579",
				"airline": {
					"iata_code": "4D",
					"color": "#7283EB",
					"airline": "AERRO DIREKT"
				},
				"departure": {
					"date": "2022-07-28",
					"time": "15:20"
				},
				"arrival": {
					"date": "2022-07-28",
					"time": "17:10"
				},
				"airports": {
					"from": {
						"name": "ANTALYA AIRPORT",
						"prefix": "AYT"
					},
					"to": {
						"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
						"prefix": "OTP"
					}
				},
				"tickets": ""
			},
			"on_request": "n",
			"has_tickets": true
		},
		"transfers": {
			"to": 17,
			"from": 18
		},
		"never_land_entrance": [],
		"gala_dinner": [],
		"aquapark_services": [],
		"tourists": {
			"adults": 2,
			"children_ages": []
		}
	},
	"2022-07-21:7:28:697_700": {
		"unique_key": "MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz",
		"rid": "JGANNj0E5iQKayhP",
		"hotel_results_counter": 4,
		"package_template": 53,
		"operator": 2,
		"additional_services": [],
		"dates": {
			"check_in": "2022-07-21",
			"check_out": "2022-07-28"
		},
		"nights": {
			"total": 7,
			"on_the_way": 0
		},
		"accommodation": {
			"hotel": {
				"id": 28,
				"name": "ADALYA OCEAN DELUXE",
				"is_exclusive": false,
				"category": "5* \/ HV1",
				"city": "SIDE",
				"in_stop": true
			},
			"room": {
				"id": 6,
				"name": "STANDARD ROOM LAND VIEW"
			},
			"placement": {
				"id": 2769,
				"name": "2AD"
			},
			"meal": {
				"id": 3,
				"name": "UAI",
				"full_name": "ULTRA ALL INCLUSIVE"
			}
		},
		"price": {
			"amount": 1959,
			"netto": 1830,
			"commission": 128.1,
			"type": "EB până la 31.07",
			"currency": "EUR",
			"currency_id": 1
		},
		"tickets": {
			"from": {
				"id": 697,
				"name": " 580",
				"airline": {
					"iata_code": "4D",
					"color": "#7283EB",
					"airline": "AERRO DIREKT"
				},
				"departure": {
					"date": "2022-07-21",
					"time": "12:30"
				},
				"arrival": {
					"date": "2022-07-21",
					"time": "14:20"
				},
				"airports": {
					"from": {
						"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
						"prefix": "OTP"
					},
					"to": {
						"name": "ANTALYA AIRPORT",
						"prefix": "AYT"
					}
				},
				"tickets": ""
			},
			"to": {
				"id": 700,
				"name": " 579",
				"airline": {
					"iata_code": "4D",
					"color": "#7283EB",
					"airline": "AERRO DIREKT"
				},
				"departure": {
					"date": "2022-07-28",
					"time": "15:20"
				},
				"arrival": {
					"date": "2022-07-28",
					"time": "17:10"
				},
				"airports": {
					"from": {
						"name": "ANTALYA AIRPORT",
						"prefix": "AYT"
					},
					"to": {
						"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
						"prefix": "OTP"
					}
				},
				"tickets": ""
			},
			"on_request": "n",
			"has_tickets": true
		},
		"transfers": {
			"to": 17,
			"from": 18
		},
		"never_land_entrance": [],
		"gala_dinner": [],
		"aquapark_services": [],
		"tourists": {
			"adults": 2,
			"children_ages": []
		}
	},
	"2022-07-21:7:27:697_700": {
		"unique_key": "MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz",
		"rid": "JGANNj0E5iQKayhP",
		"hotel_results_counter": 6,
		"package_template": 53,
		"operator": 2,
		"additional_services": [],
		"dates": {
			"check_in": "2022-07-21",
			"check_out": "2022-07-28"
		},
		"nights": {
			"total": 7,
			"on_the_way": 0
		},
		"accommodation": {
			"hotel": {
				"id": 27,
				"name": "ADALYA ELITE LARA",
				"is_exclusive": false,
				"category": "5* \/ HV1",
				"city": "ANTALYA",
				"in_stop": true
			},
			"room": {
				"id": 6,
				"name": "STANDARD ROOM LAND VIEW"
			},
			"placement": {
				"id": 2769,
				"name": "2AD"
			},
			"meal": {
				"id": 3,
				"name": "UAI",
				"full_name": "ULTRA ALL INCLUSIVE"
			}
		},
		"price": {
			"amount": 2547,
			"netto": 2380,
			"commission": 166.6,
			"type": "STD",
			"currency": "EUR",
			"currency_id": 1
		},
		"tickets": {
			"from": {
				"id": 697,
				"name": " 580",
				"airline": {
					"iata_code": "4D",
					"color": "#7283EB",
					"airline": "AERRO DIREKT"
				},
				"departure": {
					"date": "2022-07-21",
					"time": "12:30"
				},
				"arrival": {
					"date": "2022-07-21",
					"time": "14:20"
				},
				"airports": {
					"from": {
						"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
						"prefix": "OTP"
					},
					"to": {
						"name": "ANTALYA AIRPORT",
						"prefix": "AYT"
					}
				},
				"tickets": ""
			},
			"to": {
				"id": 700,
				"name": " 579",
				"airline": {
					"iata_code": "4D",
					"color": "#7283EB",
					"airline": "AERRO DIREKT"
				},
				"departure": {
					"date": "2022-07-28",
					"time": "15:20"
				},
				"arrival": {
					"date": "2022-07-28",
					"time": "17:10"
				},
				"airports": {
					"from": {
						"name": "ANTALYA AIRPORT",
						"prefix": "AYT"
					},
					"to": {
						"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
						"prefix": "OTP"
					}
				},
				"tickets": ""
			},
			"on_request": "n",
			"has_tickets": true
		},
		"transfers": {
			"to": 3,
			"from": 4
		},
		"never_land_entrance": [],
		"gala_dinner": [],
		"aquapark_services": [],
		"tourists": {
			"adults": 2,
			"children_ages": []
		}
	}
}