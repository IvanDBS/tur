POST Login
https://test-v2.obs.md/api/jwt/login
Authentication endpoint.
[POST] api/jwt/login

Required fields:

email
password
Headers
Content-Type
application/json
Accept
application/json
null
Body json
{
	"email": ""!!Missing declaration in environment!!"",
	"password": ""!!Missing declaration in environment!!""
}
Example request:
Copy to Clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/jwt/login")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Content-Type"] = "application/json"
request["Accept"] = "application/json"
request["null"] = null
request.body = "{\n\t\"email\": \"\"!!Missing declaration in environment!!\"\",\n\t\"password\": \"\"!!Missing declaration in environment!!\"\"\n}"

response = http.request(request)
puts response.read_body
Example response - 200:
{
	"token_type": "Bearer",
	"expires_in": 86400,
	"access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiMmM5ZTAzNTg4YWM3NmRkZjJhODAxNGExNGExZTM1MjAwMDU0YjdkNjYxNDhiMzEzMzhmMzVmMzdiZGRkNjdjOTk2Njg5ZTZmNTJiZjdkNTIiLCJpYXQiOjE2NTYzMjg0MjAuNDk1ODg4LCJuYmYiOjE2NTYzMjg0MjAuNDk1ODkyLCJleHAiOjE2NTY0MTQ4MjAuNDkwMDE1LCJzdWIiOiIyIiwic2NvcGVzIjpbXX0.pS6iNJTJvrKvw7zA-dHodqOlxIUJIgWS7YacGZlP91Az23eDrav6I5r2qT25LZZHVg3cLV80--ECf4Dro6-9FETuo-qBki0vMaTGWUw1YuftGKPlq3mcl70QnvuoIip3Fz9YHg9ySUx_yUKBNzq8vAQl5ydRCKYL7dhVQp6vc6KAj_HjeWSv5wdNveP3MYK79sUYNfV3TojnT7oUpNUCJ_HYS7-fAuSy5uoHFv3gI5684YTexOMgVb19p4E8DjgyJ8qJxWC-wV1qVQCeiBB6CfDgbX0wgKXIO9ynY090ryn1Bi3tXBWNDIBIsR7OMg9P5-TEPb6Isc7kVp3GxkBuwPUQP7eV3EKwX2t4mI4uS9ePAWkozxX6jkAfrXz-AXI9YoBsyNdc9WMJh89SVbncN7P6CEcHmNkbZut4QIe0HXt--Y3Aglkb8w3gF-rJ9eaIFnwwTw_QvcPUcnsn08lOR6Zc42lPTvNOrodkBGQRk_7XvW4D8m_xgcgw6vyeKv2omkh-ELT0fxPKFAyPO3dwn3taghvjZGcd96211Efr4Et3XATuAdnVrM1tCHzfiUQGNLH3ZtzbhtTx2Mhq9sNB_ZhU0MZMT6VBHVXi9gJLnn0WThCNpzPBi3EgDlU-HGkJXLeyUX0uvWXMjT71Z61RjwPdyoAhcgM_5vQD-QkktD0",
	"refresh_token": "def5020030d8695a92626cbb00f925e9786d02d0f8b757285c20c3db3bf2fb15fd06ccc3716e5ee0e660f9c5d5fe2716cbfc0c97676b55e516f9c412c138b0674b9e5228c2e58f6ea556042dbbd013bd0fdd57916780298ad76ca93b40d698c501514d793cbea87524866bb5ff59d7134e351150317c19848caac4f18fb6638251df9fbc7f6aa24a482daa3612f2d55a7da1e8b544f6365765c03217c9ebed4f634c309bb3322aba043e917627ce15855c288bb189e47f05da1d81af712fee9ff3f1f759ab8df45706a3a2050ea9156c53e12b6e4de752dfc2a36e0abbb4126ef6e78d6c0e9565b1fdc7a1ad89e653109941743921dbbe86fa3e248462c296cc808ab3e359b53b911e7e36c61586d0fb3a60ee9e56142a6426c16038ddf0e971c5d36354a657b2de25963d0e254542bfee5be8d54235a08228c63e49c94936d2e93149385305519028b57c89a5c05c2fec00315ed08bfd41e3c7b7ede5077421c9",
	"user": {
		"id": 1,
		"name": "TEST",
		"email": "test@domain.com",
		"avatar": "image_url"
	}
}
Example response - 400:
{
	"error": "Eroare la autentificare",
	"message": "Datele de identificare nu pot fi confirmate."
}
GET Logout
https://test-v2.obs.md/api/jwt/logout
Logout endpoint
[GET] /api/jwt/logout

Logout from the system

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

url = URI("https://test-v2.obs.md/api/jwt/logout")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
POST Refresh Token
https://test-v2.obs.md/api/jwt/refresh-token
Refresh token endpoint
[POST] /api/jwt/refresh-token

Refresh current token

Required fields:

refresh_token
Headers
Content-Type
application/json
Accept
application/json
Body json
{
  "refreshToken": "def50200d91342124f0307efe681017ccc6bc1326496ffdc47928fadef545690fe23e7b0a06d449ab2b6b13053ba5e04472e49b2080b8ab552ae05ecf511eb3069d48a909e78bab710352b877c322d6224d91d76eb29b8727eb251910ddcb00073ace98393a01b279578ec37a0e80d17e8f9935acfd4c819d41a1084ad17e57c02f1ce25d51a25833a506aa6cec89f001c2e7032c51c3d57e0c4092603ca23a2f844d1e54102338351db68c5915fb1a1dcf2fc7c0f01e7a04d5f2e33bdef5d3f6a6c1a34dc2f284cfda70afae7c8afac81838858b94b9e879fafc5fd0a07f2394a8d371426ce0f84232a781dc08ecf6c900d0b6bcd3f40850c132702da7f920c6dd5347f8ecc5aa672bcca67255ae03ebae182cd19a39983deda5962f12f1da2044fe2c1bcd9ff7ff37cf0e018e0c124295e20f0d0eeb7af62a7aefcce763a18618fd9b472d5f98aa608cc755c5d36b475fe7fc4a92f485d8fa55829c34e73c8dfa31d81"
}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/jwt/refresh-token")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Content-Type"] = "application/json"
request["Accept"] = "application/json"
request.body = "{\n\t\"refreshToken\": \"def50200d91342124f0307efe681017ccc6bc1326496ffdc47928fadef545690fe23e7b0a06d449ab2b6b13053ba5e04472e49b2080b8ab552ae05ecf511eb3069d48a909e78bab710352b877c322d6224d91d76eb29b8727eb251910ddcb00073ace98393a01b279578ec37a0e80d17e8f9935acfd4c819d41a1084ad17e57c02f1ce25d51a25833a506aa6cec89f001c2e7032c51c3d57e0c4092603ca23a2f844d1e54102338351db68c5915fb1a1dcf2fc7c0f01e7a04d5f2e33bdef5d3f6a6c1a34dc2f284cfda70afae7c8afac81838858b94b9e879fafc5fd0a07f2394a8d371426ce0f84232a781dc08ecf6c900d0b6bcd3f40850c132702da7f920c6dd5347f8ecc5aa672bcca67255ae03ebae182cd19a39983deda5962f12f1da2044fe2c1bcd9ff7ff37cf0e018e0c124295e20f0d0eeb7af62a7aefcce763a18618fd9b472d5f98aa608cc755c5d36b475fe7fc4a92f485d8fa55829c34e73c8dfa31d81\"\n}"

response = http.request(request)
puts response.read_body
Search
GET DepartureCities
https://test-v2.obs.md/api/v2/search/departure_cities
Departure cities endpoint
[GET] /api/v2/search/departure_cities

Get the list of available departure cities

Headers
Accept
application/json
Authorization
Bearer {access_token}
Example request:
Copy to Clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/search/departure_cities")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	{
		"id": 1,
		"label": "BUCURESTI"
	},
	{
		"id": 2,
		"label": "IASI"
	}
]
GET Countries
https://test-v2.obs.md/api/v2/search/countries
Countries endpoint
[GET] /api/v2/search/countries?airport_city_from=:airport_city_from

Get the list of available countries

Available filters

Parameters	Required	value or format	description
airport_city_from	yes	int	City id from [DepartureCities]
Parameters
airport_city_from
33785
Headers
Accept
application/json
Authorization
Bearer {access_token}
Example request:
Copy to Clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/search/countries?")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	{
		"id": 1,
		"label": "EGIPT"
	},
	{
		"id": 2,
		"label": "TURCIA"
	}
]
GET Country/PackageTemplates
https://test-v2.obs.md/api/v2/search/countries/223/package_templates?airport_city_from=33785
Package templates endpoint
[GET] /api/v2/search/countries/:country_id/package_templates?airport_city_from=:airport_city_from

country_id - id from [Countries] endpoint

airport_city_from - id from [DepartureCities] endpoint

Get the list of available package templates

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

url = URI("https://test-v2.obs.md/api/v2/search/countries/223/package_templates?airport_city_from=33785")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	{
		"id": 63,
		"label": "Antalya doar cazare",
		"services": [
			"hotel"
		]
	},
	{
		"id": 53,
		"label": "Antalya pachete avion",
		"services": [
			"hotel",
			"transfer",
			"avia_transport"
		],
		"airports": [
			{
				"id": 50004,
				"label": "ANTALYA"
			}
		]
	}
]
GET CalendarHints
https://test-v2.obs.md/api/v2/search/calendar_hints
Calendar hints endpoint
[GET] /api/v2/search/calendar_hints

Get the list of available departure dates

Available filters

Parameters	Required	value or format	description
date_from	no	string (ISO Date YYYY-MM-DD)	Start date of departure
date_to	no	string (ISO Date YYYY-MM-DD)	End date of departure
city_from	yes	int	City id from [DepartureCities]
city_to	yes	string	Comma separated city ids from [Country/PackageTemplate] airports
Parameters
date_from
2022-07-15
date_to
2022-07-15
city_from
33785
city_to
50004
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

url = URI("https://test-v2.obs.md/api/v2/search/calendar_hints?date_from=2022-07-15&city_from=33785&city_to=50004")

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
	"2022-07-21": [
		{
			"departure_date": "2022-07-21",
			"days": "7, 8, 10, 14, 15, 17, 21, 22, 24, 28",
			"airport": "ANTALYA",
			"remain": 1
		}
	],
	"2022-07-22": [
		{
			"departure_date": "2022-07-22",
			"days": "7, 9, 13, 14, 16, 20, 21, 23, 27, 28",
			"airport": "ANTALYA",
			"remain": 1
		}
	],
	"2022-07-24": [
		{
			"departure_date": "2022-07-24",
			"days": "7, 11, 12, 14, 18, 19, 21, 25, 26, 28",
			"airport": "ANTALYA",
			"remain": 1
		}
	]
}
GET AvailableNights
https://test-v2.obs.md/api/v2/search/available_nights
Available nights endpoint
[GET] /api/v2/search/calendar_hints

Get the list of available nights

Available filters

Parameters	Required	value or format	description
date_from	no	string (ISO Date YYYY-MM-DD)	Start date of departure
date_to	no	string (ISO Date YYYY-MM-DD)	End date of departure
city_from	yes	int	City id from [DepartureCities]
city_to	yes	string	Comma separated city ids from [Country/PackageTemplate] airports, Ex.:1,2,3
Parameters
date_from
2022-07-16
date_to
2022-09-16
city_from
33785
city_to
50004
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

url = URI("https://test-v2.obs.md/api/v2/search/available_nights?date_from=2022-07-16&date_to=2022-09-16&city_from=33785&city_to=50004")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	21,
	22,
	23,
	24,
	25,
	26,
	27,
	28
]
GET PackageTemplate/HotelCategories
https://test-v2.obs.md/api/v2/search/package_templates/53/hotel_categories
Package template hotel categories endpoint
[GET] /api/v2/search/package_templates/:package_template_id/hotel_categories

package_template_id - id from [Countries/PackageTemplates] endpoint

Get list of hotel categories for package template

``

Headers
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/search/package_templates/53/hotel_categories")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	{
		"id": 173,
		"label": "2*"
	},
	{
		"id": 171,
		"label": "3*"
	},
	{
		"id": 172,
		"label": "4*"
	},
	{
		"id": 174,
		"label": "5* \/ HV1"
	}
]
GET PackageTemplate/Locations
https://test-v2.obs.md/api/v2/search/package_templates/53/locations
Package template locations endpoint
[GET] /api/v2/search/package_templates/:package_template_id/locations

package_template_id - id from [Countries/PackageTemplates] endpoint

Get list of locations for package template

``

Headers
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/search/package_templates/53/locations")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	{
		"id": 4692,
		"label": "ALANYA",
		"cities": [
			{
				"id": 49995,
				"label": "ALANYA",
				"region_id": 4692
			}
		]
	},
	{
		"id": 4694,
		"label": "BELEK",
		"cities": [
			{
				"id": 50012,
				"label": "BELEK",
				"region_id": 4694
			}
		]
	}
]
GET PackageTemplate/Hotels
https://test-v2.obs.md/api/v2/search/package_templates/53/hotels
Package template hotels endpoint
[GET] /api/v2/search/package_templates/:package_template_id/hotels

package_template_id - id from [Countries/PackageTemplates] endpoint

Get list of hotels for package template

Available filters

Parameters	Required	value or format	description
cities	no	string	Cities id joined with comma from [PackageTemplate/Locations], Ex. 1,2,3
regions	no	string	Regions id joined with comma from [PackageTemplate/Locations], Ex. 1,2,3
categories	no	string	categories id joined with comma from [PackageTemplate/Hotels], Ex. 1,2,3
is_exclusive	no	bool	send if you want to see only exclusive hotels, Ex is_exlusive:1
``

Parameters
cities
50004
regions
4694
categories
173,171,172,174
is_exclusive
1
Headers
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/search/package_templates/53/hotels?cities=50004&categories=173%2C171%2C172%2C174")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	{
		"id": 4409,
		"label": "A GOOD LIFE UTOPIA FAMILY RESORT (EX. WATER PLANET)",
		"is_exclusive": 0,
		"city_id": 21,
		"category_id": 22
	},
	{
		"id": 26,
		"label": "ADALYA ARTSIDE HOTEL",
		"is_exclusive": 0,
		"city_id": 21,
		"category_id": 22
	}
]
GET PackageTemplate/Meals
https://test-v2.obs.md/api/v2/search/package_templates/53/meals
Package template meals endpoint
[GET] /api/v2/search/package_templates/:package_template_id/meals

package_template_id - id from [Countries/PackageTemplates] endpoint

Get the list of meals for package template

Headers
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/v2/search/package_templates/53/meals")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
[
	"AI and better",
	"BB",
	"FB",
	"HB",
	"RO"
]
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
