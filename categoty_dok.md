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