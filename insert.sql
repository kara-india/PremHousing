-- Generated import preview. New rows remain draft for individual PREM review.
-- This file has not been executed against any Supabase project.
begin;

insert into public.localities (name, slug, city, region)
values ('Mira Road', 'mira-road', 'Mira-Bhayandar', 'Maharashtra')
on conflict (slug) do nothing;

with incoming_data (title, price, area, beds, baths, furnishing, builder, status, possession, txn, floor, facing, overlooking, parking, balconies) as (
values
('2 BHK Flat for Sale in Aim Vyana, Mira Road, Mumbai', 13600000.0, 699.0, 2, 3, 'unfurnished', 'Aim Vyana', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, null, null),
('1 BHK Flat for Sale in Aim Vyana, Mira Road, Mumbai', 9000000.0, 457.0, 1, 2, 'unfurnished', 'Aim Vyana', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, null, null),
('2 BHK Flat for Sale in Aim Vyana, Mira Road, Mumbai', 14400000.0, 699.0, 2, 2, 'unfurnished', 'Aim Vyana', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, '1 Covered', null),
('3 BHK Flat for Sale in Sunteck Belvedere Park , Mira Road, Mumbai', 19700000.0, 1060.0, 3, 3, 'unfurnished', 'Sunteck Belvedere Park', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, '1 Covered', null),
('1 BHK Flat for Sale in Kashimira Forest Vista, Mira Road, Mumbai', 6580000.0, 425.0, 1, 2, 'unfurnished', 'Kashimira Forest Vista', 'Under Construction', 'Jun ''29', 'New Property', '4 out of 40', 'North - East', 'Garden/Park, Main Road', null, null),
('1 BHK Flat for Sale in Seven Eleven Ayodhya, Mira Road, Mumbai', 7200000.0, 425.0, 1, 2, 'semi-furnished', 'Seven Eleven Ayodhya', 'Under Construction', 'Dec ''28', 'New Property', '5 out of 30', 'East', 'Garden/Park, Main Road', null, null),
('2 BHK Flat for Sale in Aim Vyana, Mira Road, Mumbai', 13800000.0, 748.0, 2, 3, 'semi-furnished', 'Aim Vyana', 'Ready to Move', null, 'New Property', '16 out of 42', 'East', 'Garden/Park, Main Road', '1 Open', 1),
('2 BHK Flat for Sale in Mira Road, Mumbai', 11200000.0, 780.0, 2, 2, 'semi-furnished', null, 'Under Construction', 'Dec ''27', 'New Property', '20 out of 24', 'East', 'Garden/Park', '1 Covered', 4),
('1 BHK Flat for Sale in Arihant Balaji Serenity, Mira Road, Mumbai', 7000000.0, 426.0, 1, 2, 'semi-furnished', 'Arihant Balaji Serenity', 'Under Construction', 'Dec ''29', 'New Property', '27 out of 35', 'East', 'Garden/Park', '1 Covered,', null),
('2 BHK Flat for Sale in The Palace Tower, Mira Road, Mumbai', 11200000.0, 667.0, 2, 2, 'semi-furnished', 'The Palace Tower', 'Under Construction', 'Dec ''26', 'New Property', '35 out of 45', 'East', 'Garden/Park, Pool, Main Road', '1 Covered,', 4),
('1 BHK Flat for Sale in Mira Road, Mumbai', 6480000.0, 422.0, 1, 2, 'unfurnished', null, 'Under Construction', 'Dec ''29', 'New Property', '12 out of 32', 'East', 'Garden/Park, Pool, Main Road', null, null),
('2 BHK Flat for Sale in Mira Road, Mumbai', 10700000.0, 620.0, 2, 2, 'unfurnished', null, 'Ready to Move', null, 'New Property', '5 out of 20', 'North', 'Main Road', '1 Open', 2),
('2 BHK Flat for Sale in Lodha Casa Supremo, Mira Road, Mumbai', 13000000.0, 668.0, 2, 2, 'semi-furnished', 'Lodha Casa Supremo', 'Ready to Move', null, 'Resale', '5 out of 34', 'North', 'Garden/Park', '1 Covered', 1),
('3 BHK Flat for Sale in Sunteck Belvedere Park , Mira Road, Mumbai', 19500000.0, 1060.0, 3, 4, 'unfurnished', 'Sunteck Belvedere Park', 'Under Construction', 'Dec ''30', 'New Property', '29 out of 50', 'West', 'Main Road', '2 Covered', 2),
('2 BHK Flat for Sale in Mira Road, Mumbai', 14500000.0, 1000.0, 2, 2, 'furnished', null, 'Ready to Move', null, 'Resale', '5 out of 7', 'East', null, '1 Open', null),
('2 BHK Flat for Sale in Mira Road, Mumbai', 9400000.0, 690.0, 2, 2, 'semi-furnished', null, 'Ready to Move', null, 'New Property', '4 out of 23', 'East', 'Garden/Park, Pool, Main Road', null, 4),
('2 BHK Flat for Sale in Raj Horizon, Mira Road, Mumbai', 12500000.0, 920.0, 2, 2, 'semi-furnished', 'Raj Horizon', 'Ready to Move', null, 'Resale', '14 out of 15', 'East', 'Garden/Park, Main Road', '1 Open', 3),
('1 BHK Flat for Sale in 127 Raj Home, Mira Road, Mumbai', 6900000.0, 470.0, 1, 2, 'semi-furnished', '127 Raj Home', 'Ready to Move', null, 'New Property', '16 out of 18', 'East', 'Garden/Park, Main Road', '1 Covered,', null),
('2 BHK Flat for Sale in JP North Barcelona, Mira Road, Mumbai', 12000000.0, 685.0, 2, 2, 'semi-furnished', 'JP North Barcelona', 'Ready to Move', null, 'Resale', '18 out of 22', 'East', 'Main Road', '1 Covered', 3),
('1 BHK Flat for Sale in Kashimira Forest Vista, Mira Road, Mumbai', 6100000.0, 431.0, 1, 2, 'semi-furnished', 'Kashimira Forest Vista', 'Under Construction', 'Mar ''28', 'New Property', '16 out of 40', 'East', 'Main Road, Garden/Park, Pool', null, null),
('1 BHK Flat for Sale in JP North Aviva, Mira Road, Mumbai', 5600000.0, 450.0, 1, 2, 'semi-furnished', 'JP North Aviva', 'Ready to Move', null, 'Resale', '23 out of 36', 'East', 'Garden/Park, Pool, Main Road', null, 3),
('2 BHK Flat for Sale in Mira Road, Mumbai', 11000000.0, 741.0, 2, 2, 'semi-furnished', null, 'Ready to Move', null, 'Resale', '2 out of 6', 'West', null, null, null),
('2 BHK Flat for Sale in DB Ozone, Mira Road, Mumbai', 8500000.0, 628.0, 2, 2, 'unfurnished', 'DB Ozone', 'Ready to Move', null, 'Resale', '6 out of 29', 'East', 'Main Road', null, 2),
('2 BHK Flat for Sale in Salasar Garden, Mira Road, Mumbai', 9500000.0, 662.0, 2, 1, 'unfurnished', 'Salasar Garden', 'Ready to Move', null, 'Resale', '6 out of 7', null, null, null, null),
('3 BHK Flat for Sale in Mira Road, Mumbai', 13500000.0, 685.0, 3, 2, 'furnished', null, 'Ready to Move', null, 'Resale', '1 out of 4', 'East', 'Main Road', null, null),
('1 BHK Flat for Sale in Addon Homes, Mira Road, Mumbai', 8500000.0, 740.0, 1, 2, 'unfurnished', 'Addon Homes', 'Ready to Move', null, 'Resale', '5 out of 10', null, null, null, null),
('2 BHK Flat for Sale in Mira Road, Mumbai', 10000000.0, 910.0, 2, 2, 'unfurnished', null, 'Ready to Move', null, 'Resale', '5 out of 7', null, null, null, null),
('1 BHK Flat for Sale in JP The Palace, Mira Road, Mumbai', 12000000.0, 531.0, 1, 2, 'unfurnished', 'JP The Palace', 'Under Construction', 'Mar ''27', 'New Property', '3 out of 45', 'East', 'Garden/Park, Pool, Main Road', '1 Covered', 1),
('1 BHK Flat for Sale in Mira Road, Mumbai', 8000000.0, 412.0, 1, 2, 'semi-furnished', null, 'Ready to Move', null, 'Resale', '7 out of 7', null, null, null, null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 7250000.0, 410.0, 1, 2, 'unfurnished', null, 'Ready to Move', null, 'Resale', '14 out of 23', null, null, null, null),
('2 BHK Flat for Sale in Mira Road, Mumbai', 11000000.0, 702.0, 2, 2, 'semi-furnished', null, null, null, 'Resale', '2 out of 19', null, null, null, null),
('2 BHK Flat for Sale in Mira Road, Mumbai', 9900000.0, 654.0, 2, 2, 'unfurnished', null, 'Ready to Move', null, 'Resale', '2 out of 7', null, null, null, null),
('2 BHK Flat for Sale in Mira Road, Mumbai', 9000000.0, 632.0, 2, 2, 'unfurnished', null, 'Ready to Move', null, 'Resale', '4 out of 20', null, null, null, null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 6600000.0, 454.0, 1, 2, 'semi-furnished', null, 'Ready to Move', null, 'Resale', '14 out of 21', null, null, null, null),
('2 BHK Flat for Sale in RNA NG Paradise, Mira Road, Mumbai', 9000000.0, 716.0, 2, 2, 'semi-furnished', 'RNA NG Paradise', 'Ready to Move', null, 'Resale', '9 out of 9', null, null, null, null),
('2 BHK Flat for Sale in Rashmi Mangal Nagar, Mira Road, Mumbai', 6500000.0, 864.0, 2, 2, 'semi-furnished', 'Rashmi Mangal Nagar', 'Ready to Move', null, 'Resale', '4 out of 5', null, null, null, null),
('2 BHK  House for Sale in Mira Road Mumbai', 22500000.0, 1200.0, 2, 3, 'unfurnished', null, 'Ready to Move', null, 'Resale', null, null, null, null, 3),
('2 BHK Flat for Sale in Raj Lifestyle, Mira Road, Mumbai', 12500000.0, 1002.0, 2, 2, 'semi-furnished', 'Raj Lifestyle', 'Ready to Move', null, 'Resale', '3 out of 12', null, null, null, null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 6500000.0, 439.0, 1, 2, 'unfurnished', null, 'Ready to Move', null, 'Resale', '4 out of 7', null, null, null, null),
('2 BHK Flat for Sale in Lodha Casa Maxima , Mira Road, Mumbai', 13500000.0, 709.0, 2, 2, 'unfurnished', 'Lodha Casa Maxima', 'Ready to Move', null, 'Resale', '6 out of 23', null, 'Pool', '1 Covered', 1),
('2 BHK Flat for Sale in Silver Sarita, Mira Road, Mumbai', 7500000.0, 598.0, 2, 2, 'semi-furnished', 'Silver Sarita', 'Ready to Move', null, 'Resale', '4 out of 7', null, null, null, null),
('2 BHK Flat for Sale in MICL Aaradhya High Park, Mira Road, Mumbai', 12500000.0, 507.0, 2, 2, 'unfurnished', 'MICL Aaradhya High Park', 'Ready to Move', null, 'Resale', '20 out of 28', 'East', 'Pool, Garden/Park', null, 1),
('2 BHK Flat for Sale in Mira Road, Mumbai', 11000000.0, 540.0, 2, 2, 'semi-furnished', null, 'Ready to Move', null, 'Resale', '15 out of 23', 'East', 'Main Road', '2 Covered', 3),
('2 BHK Flat for Sale in Seven Eleven Ayodhya, Mira Road, Mumbai', 12000000.0, 812.0, 2, 2, 'unfurnished', 'Seven Eleven Ayodhya', null, null, 'New Property', null, null, null, null, null),
('2 BHK Flat for Sale in Lodha Casa Maxima , Mira Road, Mumbai', 11800000.0, 668.0, 2, 2, 'semi-furnished', 'Lodha Casa Maxima', 'Ready to Move', null, 'Resale', '8 out of 23', 'North - East', 'Garden/Park, Pool, Main Road', '1 Covered', null),
('4 BHK  House for Sale in Mira Road Mumbai', 60000000.0, 2000.0, 4, 3, 'furnished', null, 'Ready to Move', null, 'Resale', null, 'East', 'Garden/Park, Main Road', null, 3),
('2 BHK Flat for Sale in Ankur Enclave, Mira Road, Mumbai', 9500000.0, 750.0, 2, 2, 'semi-furnished', 'Ankur Enclave', 'Ready to Move', null, 'Resale', '2 out of 7', 'South', null, null, 4),
('1 BHK Flat for Sale in RNA NG Paradise, Mira Road, Mumbai', 5500000.0, 650.0, 1, 1, 'unfurnished', 'RNA NG Paradise', 'Ready to Move', null, 'Resale', '2 out of 9', null, null, null, 2),
('2 BHK Flat for Sale in Mira Road, Thane', 13000000.0, 975.0, 2, 3, 'semi-furnished', null, 'Ready to Move', null, 'Resale', '10 out of 20', 'East', 'Garden/Park', '1 Covered', 4),
('1 BHK Flat for Sale in Mira Road, Mumbai', 8500000.0, 527.0, 1, 2, 'semi-furnished', null, null, null, 'Resale', '2 out of 3', null, 'Main Road', '1 Covered', null),
('3 BHK Flat for Sale in Kalpataru Shrishti, Mira Road, Mumbai', 2100000.0, 878.0, 3, 3, 'unfurnished', 'Kalpataru Shrishti', 'Ready to Move', null, 'New Property', '1 out of 34', 'North', null, null, 1),
('2 BHK Flat for Sale in ANA Avant Garde, Mira Road, Mumbai', 12500000.0, 595.0, 2, 2, 'furnished', 'ANA Avant Garde', 'Ready to Move', null, 'New Property', '20 out of 22', 'East', 'Main Road, Garden/Park', null, 3),
('3 BHK  House for Sale in Posh Complex, Hatkesh Udhog Nagar Mumbai', 30000000.0, 1400.0, 3, 3, 'unfurnished', 'Posh Complex', 'Ready to Move', null, 'Resale', null, null, null, null, null),
('1 BHK Flat for Sale in Kashimira Forest Vista, Mira Road, Mumbai', 6000000.0, 430.0, 1, 1, 'semi-furnished', 'Kashimira Forest Vista', 'Ready to Move', null, 'Resale', '21 out of 32', null, 'Pool, Garden/Park, Main Road', null, null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 10500000.0, 477.0, 1, 2, 'unfurnished', null, 'Ready to Move', null, 'Resale', '3 out of 22', 'North', 'Garden/Park', null, 1),
('2 BHK Flat for Sale in PNK Tiara Hills, Mira Road, Mumbai', 9500000.0, 504.0, 2, 2, 'semi-furnished', 'PNK Tiara Hills', 'Ready to Move', null, 'New Property', '23 out of 23', 'South - East', 'Garden/Park', null, 4),
('2 BHK Flat for Sale in JK IRIS, Mira Road, Mumbai', 12000000.0, 658.0, 2, 2, 'unfurnished', 'JK IRIS', 'Ready to Move', null, 'Resale', '7 out of 16', 'South -West', 'Pool, Garden/Park', null, 4),
('3 BHK Flat for Sale in Mira Road, Mumbai', 17300000.0, 1130.0, 3, 3, 'furnished', null, 'Ready to Move', null, 'Resale', '11 out of 15', 'West', 'Garden/Park, Pool, Main Road', '1 Open', 4),
('2 BHK Flat for Sale in Lodha Casa Maxima , Mira Road, Mumbai', 15000000.0, 709.0, 2, 2, 'unfurnished', 'Lodha Casa Maxima', 'Ready to Move', null, 'Resale', '17 out of 23', 'South -West', 'Pool, Garden/Park', null, 1),
('1 BHK Flat for Sale in JP North Elara, Mira Road, Mumbai', 600000.0, 400.0, 1, 1, 'semi-furnished', 'JP North Elara', 'Ready to Move', null, 'Resale', '10 out of 24', null, null, null, 2),
('1 BHK Flat for Sale in Apna Ghar Phase 3, Mira Road, Mumbai', 5000000.0, 421.0, 1, 1, 'unfurnished', 'Apna Ghar Phase 3', 'Ready to Move', null, 'Resale', '6 out of 22', null, null, null, 2),
('1 BHK Flat for Sale in gaurav jatan vatan, Mira Road, Mumbai', 4600000.0, 335.0, 1, 1, 'semi-furnished', 'gaurav jatan vatan', 'Ready to Move', null, 'New Property', '4 out of 4', null, null, null, 1),
('1 BHK Flat for Sale in Mira Road, Mumbai', 7600000.0, 700.0, 1, 2, 'furnished', null, 'Ready to Move', null, 'Resale', '15 out of 15', null, null, null, 3),
('2 BHK Flat for Sale in JP North Barcelona Wing D, Mira Road, Mumbai', 11700000.0, 595.0, 2, 2, 'semi-furnished', 'JP North Barcelona Wing D', 'Ready to Move', null, 'Resale', '13 out of 24', 'North - East', 'Garden/Park, Pool', null, 2),
('4 BHK Flat for Sale in RNA COURTYARD CHS LTD, Mira Road, Mumbai', 14500000.0, 1135.0, 4, 2, 'semi-furnished', 'RNA COURTYARD CHS LTD', 'Ready to Move', null, 'Resale', '1 out of 8', null, null, null, null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 4400000.0, 540.0, 1, 2, 'unfurnished', null, 'Ready to Move', null, 'Resale', '2 out of 3', null, null, null, null),
('1 BHK Flat for Sale in JK IRIS, Mira Road, Mumbai', 7750000.0, 750.0, 1, 2, 'furnished', 'JK IRIS', 'Ready to Move', null, 'Resale', '6 out of 16', 'East', null, '1 Open', 3),
('1 BHK Flat for Sale in JP North Elara, Mira Road, Mumbai', 4200000.0, 558.0, 1, 2, 'unfurnished', 'JP North Elara', null, null, 'New Property', '15 out of 23', null, null, null, null),
('1 BHK Flat for Sale in JP North Elara, Mira Road, Mumbai', 4150000.0, 558.0, 1, 1, 'unfurnished', 'JP North Elara', null, null, 'New Property', '11 out of 23', null, null, null, null),
('2 BHK Flat for Sale in JP North Elara, Mira Road, Mumbai', 4100000.0, 558.0, 2, 2, 'unfurnished', 'JP North Elara', null, null, 'New Property', '12 out of 23', null, null, null, null),
('2 BHK Flat for Sale in RNA NG Paradise, Mira Road, Mumbai', 8000000.0, 756.0, 2, 2, 'semi-furnished', 'RNA NG Paradise', 'Ready to Move', null, 'Resale', '8 out of 9', null, null, null, null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 3100000.0, 468.0, 1, 2, 'semi-furnished', null, 'Ready to Move', null, 'Resale', '4 out of 7', null, null, null, null),
('1 BHK Flat for Sale in JP Infra Mira Road, Mira Road, Mumbai', 0.0, 558.0, 1, 2, 'unfurnished', 'JP Infra Mira Road', null, null, 'New Property', '14 out of 23', null, null, null, null),
('1 BHK Flat for Sale in JP Infra Mira Road, Mira Road, Mumbai', 0.0, 558.0, 1, 1, 'unfurnished', 'JP Infra Mira Road', null, null, 'New Property', '5 out of 23', null, null, null, null),
('2 BHK Flat for Sale in Swagat Heights, Mira Road, Mumbai', 0.0, 850.0, 2, 2, 'semi-furnished', 'Swagat Heights', 'Ready to Move', null, 'Resale', '14 out of 14', 'North', 'Garden/Park', null, 4),
('2 BHK Flat for Sale in Aim Vyana, Mira Road, Mumbai', 14300000.0, 699.0, 2, 2, 'unfurnished', 'Aim Vyana', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, '1 Covered', null),
('3 BHK Flat for Sale in Sunteck Belvedere Park , Mira Road, Mumbai', 19600000.0, 1060.0, 3, 3, 'unfurnished', 'Sunteck Belvedere Park', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, '1 Covered', null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 6450000.0, 422.0, 1, 2, 'semi-furnished', null, 'Under Construction', 'Dec ''29', 'New Property', '5 out of 32', 'East', 'Garden/Park, Pool, Main Road', null, null),
('2 BHK Flat for Sale in Prithvi Pride, Mira Road, Mumbai', 9800000.0, 652.0, 2, 2, 'semi-furnished', 'Prithvi Pride', 'Under Construction', 'Dec ''26', 'New Property', '4 out of 4', 'East', 'Garden/Park, Main Road', null, 4),
('1 BHK Flat for Sale in Arihant Balaji Serenity, Mira Road, Mumbai', 6910000.0, 426.0, 1, 2, 'semi-furnished', 'Arihant Balaji Serenity', 'Ready to Move', null, 'New Property', '11 out of 34', 'East', 'Garden/Park, Main Road', '1 Open', null),
('2 BHK Flat for Sale in Umiya Oasis, Mira Road, Mumbai', 10300000.0, 670.0, 2, 2, 'semi-furnished', 'Umiya Oasis', 'Under Construction', 'Dec ''27', 'New Property', '18 out of 22', 'East', 'Garden/Park, Pool, Main Road', '1 Covered', 4),
('2 BHK Flat for Sale in Arihant Balaji Serenity, Mira Road, Mumbai', 11100000.0, 685.0, 2, 2, 'semi-furnished', 'Arihant Balaji Serenity', 'Under Construction', 'Dec ''29', 'New Property', '31 out of 35', 'North - West', 'Main Road', '1 Covered,', null),
('1 BHK Flat for Sale in Umiya Oasis, Mira Road, Mumbai', 7200000.0, 480.0, 1, 2, 'semi-furnished', 'Umiya Oasis', 'Under Construction', 'Dec ''26', 'New Property', '18 out of 23', 'East', 'Garden/Park, Pool, Main Road', '1 Covered,', 1),
('2 BHK Flat for Sale in Mira Road, Mumbai', 10300000.0, 675.0, 2, 2, 'unfurnished', null, 'Under Construction', 'Dec ''29', 'New Property', '12 out of 32', 'East', 'Garden/Park, Pool, Main Road', null, 1),
('2 BHK Flat for Sale in Unique Ivana, Mira Road, Mumbai', 17000000.0, 750.0, 2, 2, 'furnished', 'Unique Ivana', 'Ready to Move', null, 'Resale', '11 out of 18', 'East', 'Main Road', '1 Covered', 4),
('2 BHK Flat for Sale in Sunteck Belvedere Park , Mira Road, Mumbai', 12900000.0, 699.0, 2, 2, 'unfurnished', 'Sunteck Belvedere Park', 'Under Construction', 'Dec ''30', 'New Property', '27 out of 50', 'East', 'Garden/Park', '1 Covered', 1),
('1 BHK Flat for Sale in Mira Road, Mumbai', 5480000.0, 365.0, 1, 2, 'semi-furnished', null, 'Ready to Move', null, 'New Property', '12 out of 22', 'West', 'Garden/Park, Main Road', '1 Open', null),
('2 BHK Flat for Sale in Kashimira Forest Vista, Mira Road, Mumbai', 8600000.0, 611.0, 2, 2, 'semi-furnished', 'Kashimira Forest Vista', 'Under Construction', 'Mar ''28', 'New Property', '22 out of 40', 'West', 'Garden/Park, Pool, Main Road', null, null),
('2 BHK Flat for Sale in JP North Alexa, Mira Road, Mumbai', 7500000.0, 425.0, 2, 2, 'unfurnished', 'JP North Alexa', 'Ready to Move', null, 'Resale', '11 out of 35', 'East', null, null, 3),
('3 BHK Flat for Sale in JP The Palace, Mira Road, Mumbai', 27500000.0, 1247.0, 3, 3, 'unfurnished', 'JP The Palace', 'Under Construction', 'Apr ''27', 'New Property', '3 out of 45', 'East', 'Garden/Park, Pool, Main Road', '1 Covered', 3),
('2 BHK Flat for Sale in Seven Eleven Ayodhya, Mira Road, Mumbai', 12400000.0, 836.0, 2, 2, 'unfurnished', 'Seven Eleven Ayodhya', null, null, 'New Property', null, null, null, null, 3),
('2 BHK Flat for Sale in Sunteck Belvedere Park , Mira Road, Mumbai', 13000000.0, 650.0, 2, 3, 'unfurnished', 'Sunteck Belvedere Park', 'Under Construction', 'Dec ''30', 'New Property', '9 out of 42', null, 'Garden/Park, Main Road', '1 Covered', 2),
('1 BHK Flat for Sale in Aim Vyana, Mira Road, Mumbai', 9530000.0, 457.0, 1, 1, 'unfurnished', 'Aim Vyana', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, '1 Covered', null),
('2 BHK Flat for Sale in Sunteck Belvedere Park , Mira Road, Mumbai', 13100000.0, 700.0, 2, 2, 'unfurnished', 'Sunteck Belvedere Park', 'Under Construction', 'Dec ''30', 'New Property', null, null, null, '1 Covered', null),
('2 BHK Flat for Sale in Mira Road, Mumbai', 10400000.0, 680.0, 2, 3, 'semi-furnished', null, 'Under Construction', 'Dec ''28', 'New Property', '5 out of 32', 'East', 'Garden/Park, Pool, Main Road', null, null),
('2 BHK Flat for Sale in Codename StarLife, Mira Road, Mumbai', 9900000.0, 625.0, 2, 3, 'semi-furnished', 'Codename StarLife', 'Under Construction', 'Dec ''28', 'New Property', '11 out of 39', 'East', 'Garden/Park, Pool, Main Road', null, null),
('2 BHK Flat for Sale in Aim Vyana, Mira Road, Mumbai', 12900000.0, 699.0, 2, 3, 'semi-furnished', 'Aim Vyana', 'Ready to Move', null, 'New Property', '12 out of 42', 'East', 'Garden/Park, Main Road', '1 Open', null),
('1 BHK Flat for Sale in Mira Road, Mumbai', 6560000.0, 422.0, 1, 2, 'unfurnished', null, 'Under Construction', 'Dec ''28', 'New Property', '25 out of 32', 'East', 'Garden/Park, Main Road', '1 Open', 1),
('1 BHK Flat for Sale in Umiya Oasis, Mira Road, Mumbai', 6700000.0, 480.0, 1, 2, 'semi-furnished', 'Umiya Oasis', 'Under Construction', 'Dec ''28', 'New Property', '3 out of 20', 'East', 'Garden/Park, Main Road', '1 Covered,', 3),
('1 BHK Flat for Sale in JP North Alexa, Mira Road, Mumbai', 7500000.0, 490.0, 1, 2, 'semi-furnished', 'JP North Alexa', 'Ready to Move', null, 'New Property', '30 out of 35', 'East', 'Garden/Park, Pool, Main Road', '1 Covered,', 3),
('2 BHK Flat for Sale in JP Codename Endgame, Mira Road, Mumbai', 11900000.0, 722.0, 2, 2, 'unfurnished', 'JP Codename Endgame', 'Under Construction', 'Dec ''34', 'New Property', '22 out of 35', 'East', 'Garden/Park, Pool, Main Road', '1 Open', 3),
('4 BHK Flat for Sale in JK IRIS, Mira Road, Mumbai', 35000000.0, 1554.0, 4, 4, 'furnished', 'JK IRIS', 'Ready to Move', null, 'Resale', '5 out of 16', 'West', 'Garden/Park, Pool', '4 Covered', 6)
)

insert into public.properties (
    title, property_type, transaction_type, status, locality_id, address,
    price, area_sqft, bedrooms, bathrooms, furnishing, builder, features, source_name, source_url
)
select
    i.title,
    'apartment'::public.property_type,
    'sale'::public.transaction_type,
    'draft'::public.property_status,
    (select id from public.localities where slug = 'mira-road'),
    'Mira Road, Mumbai',
    i.price,
    i.area,
    i.beds::smallint,
    i.baths::smallint,
    i.furnishing,
    i.builder,
    array_remove(array[
        case when i.status is not null then i.status end,
        case when i.possession is not null then 'Possession: ' || i.possession end,
        case when i.txn is not null then 'Transaction: ' || i.txn end,
        case when i.floor is not null then 'Floor: ' || i.floor end,
        case when i.facing is not null then 'Facing: ' || i.facing end,
        case when i.overlooking is not null then 'Overlooking: ' || i.overlooking end,
        case when i.parking is not null then 'Parking: ' || i.parking end,
        case when i.balconies is not null then 'Balconies: ' || i.balconies end,
        case when i.baths is not null then 'Bathroom: ' || i.baths end
    ], null),
    'magicbricks',
    null
from incoming_data i
where not exists (
    select 1 from public.properties p
    where p.title = i.title
      and p.price = i.price
      and coalesce(p.area_sqft, -1) = coalesce(i.area, -1)
      and coalesce(p.builder, '') = coalesce(i.builder, '')
      and coalesce(p.bedrooms, -1) = coalesce(i.beds::smallint, -1)
);

commit;
