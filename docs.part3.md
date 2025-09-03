POST Store
https://test-v2.obs.md/api/orders/air_tickets/book/IzCcDlAHH8k5NmTj
Store endpoint
[POST] /api/orders/air_tickets/:hash

hash - string from [AirTicketsSearch/Booking/Hash] response

Store booking

Request

Parameters	Required	value or format	description
total_sum	yes	float	[Book].price.total_sum
tourists	yes	array	Array of tourists
comment	yes	string	.
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
Bearer {% response 'body', 'req_b9466d2d3c1348228eb1da91da2c863d', 'b64::JC5hY2Nlc3NfdG9rZW4=::46b', 'no-history', 60 %}
Body json
{
  "tourists": [
    {
      "category": "MR",
      "first_name": "User",
      "last_name": "TEST",
      "birth_date": "01.04.2004",
      "passport_expiry_date": "12.01.2023",
      "passport_number": "AA123123",
      "fiscal_code": "1231231231312",
      "citizenship": "MOLDOVA"
    }
  ],
  "comment": "",
  "total_sum": 300
}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/orders/air_tickets/book/IzCcDlAHH8k5NmTj")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Accept"] = "application/json"
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer {% response 'body', 'req_b9466d2d3c1348228eb1da91da2c863d', 'b64::JC5hY2Nlc3NfdG9rZW4=::46b', 'no-history', 60 %}"
request.body = "{\n\t\"tourists\": [\n\t\t{\n\t\t\t\"category\": \"MR\",\n\t\t\t\"first_name\": \"User\",\n\t\t\t\"last_name\": \"TEST\",\n\t\t\t\"birth_date\": \"01.04.2004\",\n\t\t\t\"passport_expiry_date\": \"12.01.2023\",\n\t\t\t\"passport_number\": \"AA123123\",\n\t\t\t\"fiscal_code\": \"1231231231312\",\n\t\t\t\"citizenship\": \"MOLDOVA\"\n\t\t}\n\t],\n\t\"comment\": \"\",\n\t\"total_sum\": 300\n}"

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
Order
GET Index
  https://test-v2.obs.md/api/orders
Order list endpoint.
[GET] api/orders

List of orders

Available filters

Parameters	value or format	description
filters[id]	string	Order ids joined with comma, Ex. 1,2,3
filters[order_number]	string	Order number, Ex. TT22-TR/1
filters[status]	string	Statuses joined with comma, Ex. confirmed,wait
List of available statuses: ['wait','changed','confirmed','canceling','canceled','not_confirmed','penalty']

Pagination

Parameters	value or format	description
page[size]	int	Number of orders per page
page[number]	int	Page number
Parameters
filter[id]
169351
filter[order_number]
TT22-TR/597
filter[booking_time]
2022-02-11,2022-02-02
filter[check_in]
2022-02-02,2022-02-02
filter[check_out]
2022-02-01,2022-02-02
filter[departure][dates]
2022-04-26,2022-09-26
filter[arrival][dates]
21.05.2022,21.05.2022
filter[order_status]
canceled
page[number]
1
page[size]
2
Headers
Accept
application/json
X-localization
ru
Authorization
Bearer {access_token}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'

url = URI("  https://test-v2.obs.md/api/orders?")

http = Net::HTTP.new(url.host, url.port)

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["X-localization"] = "ru"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
GET Details
https://test-v2.obs.md/api/orders/203
Order details endpoint.
[GET] api/orders/:order_id

order_id - id of an order

You can get all your order details by accessing this endpoint. The only required parameter is orderId

Response
Key	Type	Description
info	array	General reservation info
hotels	array	Data about hotels
charter	array	Data about charter flights
transfers	array	Data about transfers
comments	array	List of all comments
payment	array	Data about payment and debts
order_price	float	Net price
agency_commission	float	Agency commission
order_total_sum	float	Gross price
currency	string	Currency CODE
Response/info
Key	Type	Description
order	string	Order number
booking_time	datetime (d.m.Y H:i)	Created time
owner	array	Data about owner agency and user
tourist_phone	array	Array of tourists phones and contact name
is_checked	bool	Availability of print documents
order_status	array	Current status
handler	array	Data about handler person
Response/info/owner
Key	Type	Description
agency	string	Agency name
user	string	User name
Response/info/tourist_phone
Key	Type	Desscription
phone	string	Phone number
owner	string	Phone owner name
Response/info/order_status
Key	Type	Description
name	string	Current status
class	string	Css class of this status
Response/info/handler
Key	Type	Description
name	string	Name of handler
email	string	Email of handler
phones	array	Contact phones of this person
Response/hotels
Key	Type	Description
name	string	Hotel name
city	string	Location name of the hotel
category	string	Hotel category (stars)
room	string	Room name
placement	string	Placement name and info (total ad, chd, ages)
meal	string	Full name of meal
check_in	date	d.m.Y Check-in in hotel
check_out	date	d.m.Y Check-out from hotel
days	int	Total nights in hotel
operator	string	Operator name
tourists	array	Data of tourists in hotel
Response/charter
Key	Type	Description
tourist	array	Data about tourist
fly_segments_there	array	Departure segment info
fly_segments_back	array	Arrival segment info
Response/charter/tourist
Key	Type	Description
category	string	Tourist category (mr, mrs, chd)
name	string	Tourist full name
birthday	string	Tourists birthday and age
Response/charter/flysegmentsthere
Key	Type	Description
departure_date	date	d.m.Y Date of takeof
prefix	string	Airline IATA code
flight	string	Flight number
color	string	Color of airline
fly_time	string	Interval takeof - landing
airline	string	Airline name
destination.city_from	string	Departure city
destination.airport_from	string	Departure airport code
destination.city_to	string	Arrival city
destination.airport_to	string	Arrival airport code
Response/charter/flysegmentsback
Key	Type	Description
departure_date	date	d.m.Y Date of takeof
prefix	string	Airline IATA code
flight	string	Flight number
color	string	Color of airline
fly_time	string	Interval takeof - landing
airline	string	Airline name
destination.city_from	string	Departure city
destination.airport_from	string	Departure airport code
destination.city_to	string	Arrival city
destination.airport_to	string	Arrival airport code
Response/transfers
Key	Type	Description
tourist	array	Data about tourist
airport_hotel	array	Data about transfer from airport to hotel
hotel_airport	array	Data about transfer from hotel to airport
hotel_hotel	array	Data about transfer between hotels
Response/transfers/tourist
Key	Type	Description
category	string	Tourist category (mr, mrs, chd)
name	string	Tourist full name
birthday	data	d.m.Y Tourists birthday
Response/transfers/airport_hotel
Key	Type	Description
name	string	Name of transfer
date	date	d.m.Y Date of transfer
destination.from	string	Pickup location
destination.to	string	Destination location
Response/transfers/hotel_airport
Key	Type	Description
name	string	Name of transfer
date	date	d.m.Y Date of transfer
destination.from	string	Pickup location
destination.to	string	Destination location
Response/comments
Key	Type	Description
author	string	Comment author name
text	string	Comment text
created.date	date	d.m.Y Created date
created.time	time	H:i Created time
Response/payment
Key	Type	Description
transactions	array	
debt	array	Total debt for this order, in 3 currencies (USD, EUR, RON)
debt.amount	float	Debt value
debt.exchange_rate	float	Exchange rate
debt.currency	string	Currency code
Response/payment/transactions
Key	Type	Description
payment_date	date	d.m.Y Date of received payment
source	string	Source of payment
amount	float	Sum of payment
currency	string	Currency code
exchange_rate	float	Exchange rate
order_amount	float	Amount in order currency
confirmed	bool	Is confirmed by bookkepers
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

url = URI("https://test-v2.obs.md/api/orders/203")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["Accept"] = "application/json"
request["Authorization"] = "Bearer {access_token}"

response = http.request(request)
puts response.read_body
Example response - 200:
{}
Example response - 404:
{
	"message": "No query results for this record"
}
POST CancelRequest
https://test-v2.obs.md/api/orders/166922/cancel_request
Cancel request endpoint.
[POST] /api/orders/166922/cancel_request

order_id - id of an order

You can send cancel request at any time after reservation, but not after any of included services took place.

Required fields:

reason (string) - the reason why you are canceling this reservation
Headers
Accept
application/json
X-localization
ro
Content-Type
application/json
Authorization
Bearer {% response 'body', 'req_b9466d2d3c1348228eb1da91da2c863d', 'b64::JC5hY2Nlc3NfdG9rZW4=::46b', 'no-history', 60 %}
Body json
{
  "reason": "Please cancel this order"
}
Example request:
Copy to clipboard
require 'uri'
require 'net/http'
require 'openssl'

url = URI("https://test-v2.obs.md/api/orders/166922/cancel_request")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(url)
request["Accept"] = "application/json"
request["X-localization"] = "ro"
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer {% response 'body', 'req_b9466d2d3c1348228eb1da91da2c863d', 'b64::JC5hY2Nlc3NfdG9rZW4=::46b', 'no-history', 60 %}"
request.body = "{\n\t\"reason\": \"Please cancel this order\"\n}"

response = http.request(request)
puts response.read_body
Example response - 200:
{}
Example response - 422:
{
	"message": "The given data was invalid.",
	"errors": {
		"reason": [
			"The reason field is required."
		]
	}
}
Example response - 403:
{
	"message": "Error! This reservation cannot be canceled."
}