# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2024_12_20_000012) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "api_logs", force: :cascade do |t|
    t.string "endpoint", null: false
    t.text "request"
    t.text "response"
    t.integer "status"
    t.datetime "created_at", null: false
    t.index ["created_at"], name: "index_api_logs_on_created_at"
    t.index ["endpoint"], name: "index_api_logs_on_endpoint"
    t.index ["status"], name: "index_api_logs_on_status"
  end

  create_table "availabilities", force: :cascade do |t|
    t.bigint "package_id", null: false
    t.date "date", null: false
    t.string "status", null: false
    t.integer "capacity"
    t.json "raw_json"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date"], name: "index_availabilities_on_date"
    t.index ["package_id", "date"], name: "index_availabilities_on_package_id_and_date", unique: true
    t.index ["package_id"], name: "index_availabilities_on_package_id"
    t.index ["status"], name: "index_availabilities_on_status"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "search_query_id"
    t.string "obs_booking_hash", null: false
    t.string "obs_order_id"
    t.string "status", default: "pending", null: false
    t.decimal "total_amount", precision: 10, scale: 2
    t.json "tour_details"
    t.json "customer_data"
    t.text "notes"
    t.datetime "expires_at"
    t.datetime "confirmed_at"
    t.datetime "cancelled_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_bookings_on_expires_at"
    t.index ["obs_booking_hash"], name: "index_bookings_on_obs_booking_hash", unique: true
    t.index ["obs_order_id"], name: "index_bookings_on_obs_order_id"
    t.index ["search_query_id"], name: "index_bookings_on_search_query_id"
    t.index ["status"], name: "index_bookings_on_status"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "cities", force: :cascade do |t|
    t.string "name", null: false
    t.string "type", null: false
    t.integer "obs_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_cities_on_name"
    t.index ["obs_id"], name: "index_cities_on_obs_id", unique: true
    t.index ["type"], name: "index_cities_on_type"
  end

  create_table "hotels", force: :cascade do |t|
    t.string "name", null: false
    t.integer "stars"
    t.string "region"
    t.integer "obs_id"
    t.json "raw_json"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_hotels_on_name"
    t.index ["obs_id"], name: "index_hotels_on_obs_id", unique: true
    t.index ["region"], name: "index_hotels_on_region"
    t.index ["stars"], name: "index_hotels_on_stars"
  end

  create_table "jwt_denylist", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.index ["jti"], name: "index_jwt_denylist_on_jti", unique: true
  end

  create_table "packages", force: :cascade do |t|
    t.bigint "hotel_id", null: false
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2
    t.integer "obs_id"
    t.json "raw_json"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["hotel_id"], name: "index_packages_on_hotel_id"
    t.index ["name"], name: "index_packages_on_name"
    t.index ["obs_id"], name: "index_packages_on_obs_id", unique: true
    t.index ["price"], name: "index_packages_on_price"
  end

  create_table "search_queries", force: :cascade do |t|
    t.bigint "user_id"
    t.string "obs_search_id", null: false
    t.text "search_params", null: false
    t.json "search_results"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_search_queries_on_expires_at"
    t.index ["obs_search_id"], name: "index_search_queries_on_obs_search_id", unique: true
    t.index ["user_id"], name: "index_search_queries_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "obs_user_id", null: false
    t.text "obs_access_token"
    t.text "obs_refresh_token"
    t.datetime "obs_token_expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "provider", default: "email", null: false
    t.string "uid", default: "", null: false
    t.json "tokens"
    t.string "first_name"
    t.string "last_name"
    t.string "phone"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["obs_user_id"], name: "index_users_on_obs_user_id", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  add_foreign_key "availabilities", "packages"
  add_foreign_key "bookings", "search_queries"
  add_foreign_key "bookings", "users"
  add_foreign_key "packages", "hotels"
  add_foreign_key "search_queries", "users"
end
