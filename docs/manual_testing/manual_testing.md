# Testing bugs:

## First Tesing:

### WEB: 
1. catalogue not displaying
2. continue with google / sign in not working , button is linking to this link https://placeholder.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback%3Fnext%3D%252Fcheckout&code_challenge=NwikmP2vkP3f4fnxFo1PQ4ohfmHw8-KYTzERkQf8QGQ&code_challenge_method=s256
3. account creation only business , add for normal customer too 
4. sign in/ sign up both show , now only sign in displaying
5. error in account creation for business / displaying failed to fetch 
6. in guestctabanner.tsx of homepage web , talk to sale representative button ui disturbed opposite change color 
7. reset details all over website , phone number: 03125120693 , owner : (Nafaj Taj , Kamran Malik ) , Address: Main GT Road , New City Phase 1 , Wah Cantt , Delivery locations: wah cantt , hassan abdal , Taxila , Rawalpindi. set details in footer, about page
8. minimalize everything for mobile , hero section should in single display, every section in web which is fully displayed on the screen so in the mobile it should be like this , make the cards small for mobile should be fit in one row 
9. make the navbar rounded not fully stretched all over the screen , remain sticky

### ADMIN:
1. admin details saved as number for username , but in the sign in page it is asking for email , set the admin demo login details 
when this passes then admin can be tested 

### API: 
1. ERROR [ExceptionHandler] Error: Missing









## Second Testing:
### WEB:
1. Database connection error, catalogue not displayed (Unable to connect to server)
2. Not creating customer account (Showing failed to fetch)
3. Not creating Business owner account (Shwowing failed to fetch)
4. Catalouge page in center not stretch to full width , stretch to full width
5. Google Sign in not working (Showing Google authentication requires a configured Supabase project (NEXT_PUBLIC_SUPABASE_URL).)

### ADMIN:
1. Still not signing in 

### API: 
1. ERROR [ExceptionHandler] Error: Missing












## Third Testing:

### WEB:
1. Sign in with google working but showing Choose an account to continue to pqlmgqzpjjllhgalyhwz.supabase.co , after selecting ahmedraa0007@gmail.com it returns to sign in page not siging in.

2. Customer sign in half working , email verification sent to the mail , in mail on clicking the confirm email address it is just opening the website again , just showing on the current to check the mail box no further action (recommended solution: add a OTP verification send an OTP to the customer email address and verify it from the website)

3. Wholesale Account registration : Button working , displaying email verification sent to email but no mail can be seen (recommended solution: add a OTP verification send an OTP to the customer email address and verify it from the website)


