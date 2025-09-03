Booking
GET Book
https://test-v2.obs.md/api/v2/orders/book/PD1c2URQrGhqRn46
Book endpoint
[GET] /api/v2/orders/book/:hash hash - string from [rid]:[unique_key] from search response

Example:

{
"unique_key": "MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz",
"rid": "JGANNj0E5iQKayhP"
}
JGANNj0E5iQKayhP:MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz

Get data for booking.

Response

Parameters	value or format	description
countries	array	List of available countries for citizenship
currencies	array	List of available currencies
hotel	array	Hotel information
tourists	array	Tourists restrictions
services	array	List of available services
notes	array	List of available notes
price	object	Price object
show_price_decoding	bool	.
can_edit_commission	bool	.
show_company_mark_up	bool	.
Headers
Acept
application/json
Content-Type
application/json
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/orders/book/PD1c2URQrGhqRn46")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Acept"] = "application/json"
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
{
	"countries": [
		{
			"id": 180,
			"name": "ROMANIA"
		}
	],
	"currencies": [
		{
			"id": 1,
			"name": "EUR"
		},
		{
			"id": 2,
			"name": "USD"
		}
	],
	"hotel": {
		"hotel": "AYDINBEY GOLD DREAMS HOTEL",
		"hotel_category": "5* \/ HV1",
		"city": "ALANYA",
		"special": false,
		"room": "STANDARD ROOM",
		"placement": "2AD",
		"meal": "ULTRA ALL INCLUSIVE",
		"check_in": "04.08.2022",
		"check_out": "11.08.2022",
		"nights": 7
	},
	"flights": {
		"there": {
			"date": "04.08.2022",
			"day": "Joi",
			"flight_number": {
				"prefix": "4D",
				"number": " 580",
				"color": "#7283EB"
			},
			"airline": {
				"name": "AERRO DIREKT",
				"logo": "4D"
			},
			"departure": {
				"time": "12:30",
				"airport": {
					"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
					"prefix": "OTP"
				}
			},
			"flight_time": "01:50",
			"arrival": {
				"time": "14:20",
				"airport": {
					"name": "ANTALYA AIRPORT",
					"prefix": "AYT"
				}
			}
		},
		"back": {
			"date": "11.08.2022",
			"day": "Joi",
			"flight_number": {
				"prefix": "4D",
				"number": " 579",
				"color": "#7283EB"
			},
			"airline": {
				"name": "AERRO DIREKT",
				"logo": "4D"
			},
			"departure": {
				"time": "15:20",
				"airport": {
					"name": "ANTALYA AIRPORT",
					"prefix": "AYT"
				}
			},
			"flight_time": "01:50",
			"arrival": {
				"time": "17:10",
				"airport": {
					"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
					"prefix": "OTP"
				}
			}
		}
	},
	"tourists": [
		{
			"age": 20,
			"category": "MR",
			"birth_date": "2004-08-05",
			"min_birth_date": "1922-08-05",
			"max_birth_date": "2004-08-04",
			"min_passport_date": "2023-02-04"
		},
		{
			"age": 20,
			"category": "MR",
			"birth_date": "2004-08-05",
			"min_birth_date": "1922-08-05",
			"max_birth_date": "2004-08-04",
			"min_passport_date": "2023-02-04"
		}
	],
	"services": {
		"transfers": [
			{
				"id": "9:10",
				"label": "GROUP (BUS) "
			},
			{
				"id": "167:168",
				"label": "INDIVIDUAL MINIBUS (AYT-ALANYA)  - INDIVIDUAL MINIBUS (ALANYA-AYT) "
			}
		]
	},
	"notes": [
		"Honeymooners",
		"Hotel's regular guest(s)",
		"Twin beds (according possibility)",
		"Ground floor",
		"NOT ground floor",
		"Baby cot",
		"Handicap accessible room (according possibility)",
		"Double bed\/King size (according possibility)"
	],
	"price": {
		"order_sum": 1240,
		"commission_sum": 87,
		"total_sum": 1327
	},
	"show_price_decoding": false,
	"can_edit_commission": false,
	"show_company_mark_up": false,
	"values": {
		"transfers": "9:10"
	}
}
POST Calculate
https://test-v2.obs.md/api/v2/orders/calculate/w3mWxXPMvDfjfh1a
Calculate endpoint
[POST] /api/v2/orders/calculate/:hash

hash - string from [rid]:[unique_key] from search response

Example:

{
"unique_key": "MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz",
"rid": "JGANNj0E5iQKayhP"
}
JGANNj0E5iQKayhP:MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz

Calculate final price of booking

Request

Parameters	Required	value or format	description
total_sum	yes	float	[Book].price.total_sum
tourists	yes	array	Array of tourists
comment	yes	string	.
notes	yes	array	Array of notes from [Book].notes
gala_dinner	yes	array	.
aquapark_services	yes	array	.
never_land_entrance	yes	array	.
Tourist

Parameters	Required	value or format	description
category	yes	string	One of ["MR", "MRS", "CHD"]
last_name	yes	string	Tourist last name
first_name	yes	string	Tourist first name
birth_date	yes	string (ISO Date YYYY-MM-DD)	Tourist birth date
passport_number	no	string	.
passport_expiry_date	no	string (ISO Date YYYY-MM-DD)	.
citizenship	yes	string	Country name, ex. ROMANIA
Response

When total_sum from object was changed:

You will receive new total_sum
When total_sum from object not was changed

You will receive empty object
 {}
When hash not found:

Headers
Accept
application/json
Content-Type
application/json
Authorization
Bearer {access_token}
Body json
{
  "selectedServices": [
    "hotel",
    "avia_transport"
  ],
  "aquapark_services": [],
  "never_land_entrance": [],
  "gala_dinner": [],
  "tourists": [
    {
      "category": "MR",
      "first_name": "TEST",
      "last_name": "USER",
      "birth_date": "01.04.2004",
      "passport_expiry_date": "12.01.2023",
      "passport_number": "XX11111111",
      "fiscal_code": "123456789",
      "citizenship": "ROMANIA"
    },
    {
      "category": "MR",
      "first_name": "TEST",
      "last_name": "TEST",
      "birth_date": "01.04.2004",
      "passport_expiry_date": "12.01.2023",
      "passport_number": "XX11111112",
      "fiscal_code": "123456781",
      "citizenship": "ROMANIA"
    }
  ],
  "comment": "",
  "notes": [
    "Honeymooners",
    "Hotel's regular guest(s)"
  ],
  "total_sum": 1445
}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/orders/calculate/w3mWxXPMvDfjfh1a")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Accept"] = "application/json"
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer {access_token}"
request.body = "{\n\t\"selectedServices\": [\n\t\t\"hotel\",\n\t\t\"avia_transport\"\n\t],\n\t\"aquapark_services\": [],\n\t\"never_land_entrance\": [],\n\t\"gala_dinner\": [],\n\t\"tourists\": [\n\t\t{\n\t\t\t\"category\": \"MR\",\n\t\t\t\"first_name\": \"TEST\",\n\t\t\t\"last_name\": \"USER\",\n\t\t\t\"birth_date\": \"01.04.2004\",\n\t\t\t\"passport_expiry_date\": \"12.01.2023\",\n\t\t\t\"passport_number\": \"XX11111111\",\n\t\t\t\"fiscal_code\": \"123456789\",\n\t\t\t\"citizenship\": \"ROMANIA\"\n\t\t},\n\t\t{\n\t\t\t\"category\": \"MR\",\n\t\t\t\"first_name\": \"TEST\",\n\t\t\t\"last_name\": \"TEST\",\n\t\t\t\"birth_date\": \"01.04.2004\",\n\t\t\t\"passport_expiry_date\": \"12.01.2023\",\n\t\t\t\"passport_number\": \"XX11111112\",\n\t\t\t\"fiscal_code\": \"123456781\",\n\t\t\t\"citizenship\": \"ROMANIA\"\n\t\t}\n\t],\n\t\"comment\": \"\",\n\t\"notes\": [\n\t\t\"Honeymooners\",\n\t\t\"Hotel's regular guest(s)\"\n\t],\n\t\"total_sum\": 1445\n}"

response = http.request(request)
puts response.read_body
Example response - 422:
{
	"order_sum": 1350,
	"commission_sum": 95,
	"total_sum": 1445
}
Example response - 404:
[]
POST Store
https://test-v2.obs.md/api/v2/orders/book/w3mWxXPMvDfjfh1a
Store endpoint
[POST] /api/v2/orders/book/:hash

hash - string from [rid]:[unique_key] from search response

Example:

{
"unique_key": "MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz",
"rid": "JGANNj0E5iQKayhP"
}
JGANNj0E5iQKayhP:MjAyMi0xMC0yNjoyMzoyOjgwOTY6MTozMToyNzY5OjEyNjI4XzEyNDcz

Store booking

Request

Parameters	Required	value or format	description
total_sum	yes	float	[Book].price.total_sum
tourists	yes	array	Array of tourists
comment	yes	string	.
notes	yes	array	Array of notes from [Book].notes
gala_dinner	yes	array	.
aquapark_services	yes	array	.
never_land_entrance	yes	array	.
Tourist

Parameters	Required	value or format	description
category	yes	string	One of ["MR", "MRS", "CHD"]
last_name	yes	string	Tourist last name
first_name	yes	string	Tourist first name
birth_date	yes	string (ISO Date YYYY-MM-DD)	Tourist birth date
passport_number	no	string	.
passport_expiry_date	no	string (ISO Date YYYY-MM-DD)	.
citizenship	yes	string	Country name, ex. ROMANIA
Response

When total_sum from object was changed:

You will receive new total_sum
When total_sum from object not was changed

You will receive empty object
{
    "order_number": "TT22-TR\/19"
}
When hash not found:

Headers
Accept
application/json
Content-Type
application/json
Authorization
Bearer {access_token}
Body json
{
  "selectedServices": [
    "hotel",
    "avia_transport"
  ],
  "aquapark_services": [],
  "never_land_entrance": [],
  "gala_dinner": [],
  "tourists": [
    {
      "category": "MR",
      "first_name": "TEST",
      "last_name": "USER",
      "birth_date": "01.04.2004",
      "passport_expiry_date": "12.01.2023",
      "passport_number": "XX11111111",
      "fiscal_code": "123456789",
      "citizenship": "ROMANIA"
    },
    {
      "category": "MR",
      "first_name": "TEST",
      "last_name": "TEST",
      "birth_date": "01.04.2004",
      "passport_expiry_date": "12.01.2023",
      "passport_number": "XX11111112",
      "fiscal_code": "123456781",
      "citizenship": "ROMANIA"
    }
  ],
  "comment": "",
  "notes": [
    "Honeymooners",
    "Hotel's regular guest(s)"
  ],
  "total_sum": 1445
}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/orders/book/w3mWxXPMvDfjfh1a")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Accept"] = "application/json"
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer {access_token}"
request.body = "{\n\t\"selectedServices\": [\n\t\t\"hotel\",\n\t\t\"avia_transport\"\n\t],\n\t\"aquapark_services\": [],\n\t\"never_land_entrance\": [],\n\t\"gala_dinner\": [],\n\t\"tourists\": [\n\t\t{\n\t\t\t\"category\": \"MR\",\n\t\t\t\"first_name\": \"TEST\",\n\t\t\t\"last_name\": \"USER\",\n\t\t\t\"birth_date\": \"01.04.2004\",\n\t\t\t\"passport_expiry_date\": \"12.01.2023\",\n\t\t\t\"passport_number\": \"XX11111111\",\n\t\t\t\"fiscal_code\": \"123456789\",\n\t\t\t\"citizenship\": \"ROMANIA\"\n\t\t},\n\t\t{\n\t\t\t\"category\": \"MR\",\n\t\t\t\"first_name\": \"TEST\",\n\t\t\t\"last_name\": \"TEST\",\n\t\t\t\"birth_date\": \"01.04.2004\",\n\t\t\t\"passport_expiry_date\": \"12.01.2023\",\n\t\t\t\"passport_number\": \"XX11111112\",\n\t\t\t\"fiscal_code\": \"123456781\",\n\t\t\t\"citizenship\": \"ROMANIA\"\n\t\t}\n\t],\n\t\"comment\": \"\",\n\t\"notes\": [\n\t\t\"Honeymooners\",\n\t\t\"Hotel's regular guest(s)\"\n\t],\n\t\"total_sum\": 1445\n}"

response = http.request(request)
puts response.read_body
Example response - 422:
{
	"order_sum": 1350,
	"commission_sum": 95,
	"total_sum": 1445
}
Example response - 404:
[]
AirTicketsSearch
GET Filters
https://test-v2.obs.md/api/air_tickets_search/filters
Filters endpoint
[GET] /api/air_tickets_search/filters

Get filters for [AirTicketsSearch/Search]

Response

Parameters	value or format	description
departure_airports	array	List of airports with possible_arrivals
arrival_airports	array	List of available airports
available_dates	array	List of available dates, first key departure, second key arrival and values are available dates
start_date	string (ISO Date YYYY-MM-DD)	First available departure date
end_date	string (ISO Date YYYY-MM-DD)	Last available departure date
Headers
Accept
application/json
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/air_tickets_search/filters")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
{
	"departure_airports": [
		{
			"id": 679,
			"name": "BUCURESTI, ROMANIA (OTP)",
			"country_name": "ROMANIA",
			"possible_arrivals": [
				1
			]
		},
		{
			"id": 1,
			"name": "ANTALYA, TURCIA (AYT)",
			"country_name": "TURCIA",
			"possible_arrivals": [
				679
			]
		}
	],
	"arrival_airports": [
		{
			"id": 1,
			"name": "ANTALYA, TURCIA (AYT)",
			"country_name": "TURCIA"
		},
		{
			"id": 679,
			"name": "BUCURESTI, ROMANIA (OTP)",
			"country_name": "ROMANIA"
		}
	],
	"available_dates": {
		"1": {
			"679": [
				"2022-07-24",
				"2022-07-28",
				"2022-07-29",
				"2022-07-31",
				"2022-08-04",
				"2022-08-05",
				"2022-08-07",
				"2022-08-11",
				"2022-08-12",
				"2022-08-14",
				"2022-08-18",
				"2022-09-02",
				"2022-09-04",
				"2022-09-08",
				"2022-09-09",
				"2022-09-11",
				"2022-09-15",
				"2022-09-16"
			]
		},
		"679": {
			"1": [
				"2022-08-07",
				"2022-08-11",
				"2022-08-12",
				"2022-08-18",
				"2022-08-19",
				"2022-08-21",
				"2022-08-25",
				"2022-08-26",
				"2022-08-28"
			]
		}
	},
	"start_date": "2022-07-22",
	"end_date": "2023-12-31"
}
POST Search
https://test-v2.obs.md/api/air_tickets_search
Search endpoint
[POST] /api/air_tickets_search/filters

Search air tickets

Request

Parameters	Required	value or format	description
departure_airport	yes	int	ID of departure airport, Look at filters departure_airports
arrival_airport	yes	int	ID of arrival airport, Look at filters arrival_airports
departure_date	yes	string (ISO Date YYYY-MM-DD)	Date of departure
return_date	yes	string (ISO Date YYYY-MM-DD)	Empty or Date of return (Round trip)
ad	yes	int	Number of adults
chd	yes	int	Number of childs
inf	yes	int	Number of infants
range	yes	int	Days range, default:0, max: 3. Ex. If departure_date='2022-01-01' and range 2, than search will return all possible flights for ['2022-01-01', '2022-01-02', '2022-01-03']
Response

Structure of result

Parameters	value or format	description
segments	array	See Structure of segment
price	array	See Structure of price
data	array	Data for booking
Structure of segment

Parameters	value or format	description
airline	array	Airline Information(name, shor_name, color)
flight	array	Flight Information(prefix, number)
date	array	Date
time	array	Time(departure, arrival)
direction	array	Data about direction(departure, arrival))
requirements	text	Requirements text
has_tickets	bool	Tickets availability
Structure of price

Parameters	value or format	description
amount	float	Ticket price
netto	float	Ticket price without commission
commission	float	Commission
currency	string	Currency abbreviature(EUR,USD)
Headers
Accept
application/json
Content-Type
application/json
X-localization
ro
Authorization
Bearer {access_token}
Body json
{
  "departure_airport": 679,
  "arrival_airport": 1,
  "departure_date": "2022-08-07",
  "return_date": "",
  "ad": 1,
  "chd": 0,
  "inf": 0,
  "range": 0
}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/air_tickets_search")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Accept"] = "application/json"
request["Content-Type"] = "application/json"
request["X-localization"] = "ro"
request["Authorization"] = "Bearer {access_token}"
request.body = "{\n\t\"departure_airport\": 679,\n\t\"arrival_airport\": 1,\n\t\"departure_date\": \"2022-08-07\",\n\t\"return_date\": \"\",\n\t\"ad\": 1,\n\t\"chd\": 0,\n\t\"inf\": 0,\n\t\"range\": 0\n}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	{
		"segments": [
			{
				"airline": {
					"name": "AERRO DIREKT",
					"short_name": "4D",
					"color": "#7283EB"
				},
				"flight": {
					"prefix": "4D",
					"number": " 580"
				},
				"date": [
					"7 aug. 2022",
					"Dum"
				],
				"time": [
					"12:30",
					"14:20"
				],
				"direction": {
					"from": {
						"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
						"prefix": "OTP"
					},
					"to": {
						"name": "ANTALYA AIRPORT",
						"prefix": "AYT"
					}
				},
				"requirements": "",
				"has_tickets": true
			}
		],
		"price": {
			"amount": 248,
			"netto": 232,
			"commission": 16,
			"currency": "EUR"
		},
		"data": {
			"currency_id": 1,
			"segment_there": 779,
			"tourists": {
				"adults": 1,
				"children": 0,
				"infants": 0
			}
		}
	}
]
Booking
POST Hash
https://test-v2.obs.md/api/orders/air_tickets/hash
Hash endpoint
[POST] /api/orders/air_tickets/hash

Generating Hash for current booking air tickets.

result - result object from search response [AirTicketsSearch/Search]

Request

result.data

Response

Headers
Content-Type
application/json
Accept
application/json
Authorization
Bearer {access_token}
Body json
{
  "currency_id": 1,
  "segment_there": 779,
  "tourists": {
    "adults": 1,
    "children": 0,
    "infants": 0
  }
}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/orders/air_tickets/hash")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Content-Type"] = "application/json"
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"
request.body = "{\n\t\"currency_id\": 1,\n\t\"segment_there\": 779,\n\t\"tourists\": {\n\t\t\"adults\": 1,\n\t\t\"children\": 0,\n\t\t\"infants\": 0\n\t}\n}"

response = http.request(request)
puts response.read_body
Example response - 200:
{
	"expires_in": 1380000,
	"hash": "2oM8WFXb0q4WnElz"
}
GET Book
https://test-v2.obs.md/api/orders/air_tickets/book/sGXecxZ8w4pomkD6
Book endpoint
[GET] /api/orders/air_tickets/book/:hash

hash - string from [AirTicketsSearch/Booking/Hash] response

Get data for booking.

Response

Parameters	value or format	description
countries	array	List of available countries for citizenship
currencies	array	List of available currencies
flights	array	Flights information
tourists	array	Tourists restrictions
price	object	Price object
show_price_decoding	bool	.
can_edit_commission	bool	.
show_company_mark_up	bool	.
Headers
Accept
application/json
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/orders/air_tickets/book/sGXecxZ8w4pomkD6")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
{
	"countries": [
		{
			"id": 1,
			"name": "AFGHANISTAN"
		}
	],
	"currencies": [
		{
			"id": 1,
			"name": "EUR"
		},
		{
			"id": 2,
			"name": "USD"
		}
	],
	"flights": {
		"there": {
			"date": "07.08.2022",
			"day": "Duminică",
			"flight_number": {
				"prefix": "4D",
				"number": " 580",
				"color": "#7283EB"
			},
			"airline": {
				"name": "AERRO DIREKT",
				"logo": "4D"
			},
			"departure": {
				"time": "12:30",
				"airport": {
					"name": "HENRI COANDĂ INTERNATIONAL AIRPORT",
					"prefix": "OTP"
				}
			},
			"flight_time": "01:50",
			"arrival": {
				"time": "14:20",
				"airport": {
					"name": "ANTALYA AIRPORT",
					"prefix": "AYT"
				}
			}
		}
	},
	"tourists": [
		{
			"age": 17,
			"category": "MR",
			"birth_date": "2004-08-08",
			"min_birth_date": "1922-08-08",
			"max_birth_date": "2010-08-07",
			"min_passport_date": "2023-02-07"
		}
	],
	"price": {
		"order_sum": 232,
		"commission_sum": 17,
		"total_sum": 249
	},
	"show_price_decoding": false,
	"can_edit_commission": false,
	"show_company_mark_up": false
}