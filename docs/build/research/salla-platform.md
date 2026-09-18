# Salla platform facts for the OptimalX build

Research date: 2026-09-17. Lens: platform facts that constrain or enable the OptimalX storefront build on Salla.
Sources checked: docs.salla.dev, docs.salla.sa, help.salla.sa, salla.partners, salla.sa blog, apps.salla.sa. Every fact carries the URL it came from and the access date. Where a fact is not documented, it is marked NOT DOCUMENTED.

Status: in progress (written incrementally).

## 1. Booking products

Primary source: help.salla.sa, "إضافة منتج الحجوزات وجدولة المواعيد" (published 2026-03-14, modified 2026-08-22), https://help.salla.sa/article/-%D8%A5%D8%B6%D8%A7%D9%81%D8%A9-%D9%85%D9%86%D8%AA%D8%AC-%D8%A7%D9%84%D8%AD%D8%AC%D9%88%D8%B2%D8%A7%D8%AA/nd8lrpd55t4uw7zyz6fbps6a (accessed 2026-09-17).

### What the merchant configures (dashboard)

Add flow: Products > New product > choose type "منتج حجوزات" > enter base data > Save. Base data listed in the article:
- One or more images.
- Product name (shown to the customer).
- Product price (sale price).
- "العدد المتاح للحجز في الموعد" = number of seats available in each slot (capacity per slot).
- Product category.
- Product details (product data, booking schedule, order form).

Schedule ("جدولة الحجوزات" tab inside product data):
- Two booking systems: "أيام" (days only) or "أيام وأوقات" (days and times).
- Excluded dates: add specific dates to exclude from booking ("تحديد تواريخ محددة لاستثنائها").
- Late-booking limit ("الحد من الحجوزات المتأخرة"): a lead time before which the customer must book; set to 0 to disable. The FAQ confirms this is how the merchant sets "the last time a customer can book".
- Buffer ("فترة التجهيز" / "الوقت المستقطع للتجهيز بين المواعيد"): only in the days-and-times system; set to 0 to remove.
- Whole-day for one customer: use the "days" system with capacity 1 seat; the checkout then shows "مكتمل" (full) and no other customer can book that day.
- Multiple sessions per product: "حجز عدة مواعيد لنفس العميل" in the schedule tab.
- Scheduling horizon: FAQ says appointments can be scheduled up to 12 months ahead.
- Timezone: FAQ says only Saudi Arabia time is available at present.
- Table styling: FAQ says the calendar colour follows the store theme colour; not separately customisable.

Order form custom fields (نموذج الطلب): supported field types named in the article are image upload, map location, file upload, colour picker. File upload accepts png, jpg, pdf, word, exl (Excel), svg, txt; fields can be required and conditionally shown. Max 10 fields in the booking order form (FAQ). A map field "helps you set where the service will be delivered"; more than one map field is allowed.

Capacity per day: the article only describes capacity per slot ("العدد المتاح للحجز في الموعد الواحد"). A separate per-day cap is NOT DOCUMENTED; the only per-day lever documented is the days system with capacity 1, or excluding dates.

Duration and branch/location: a per-slot duration field is not named in the article text (the screenshots are not readable in the scrape). Slot duration is therefore NOT DOCUMENTED in prose; the days-and-times system implies slot times exist. A branch/location picker on the booking product is NOT DOCUMENTED; the only location mechanism described is the map custom field. Confirmation: the FAQ says the seat is reserved on completed direct payment; with "أمهلني عند الدفع" (pay later) the seats are not decremented.

Booking management: Orders > "الحجوزات" (bookings) table; click any booking for details. Merchant can cancel: in the time system by editing booking days, in the day system by adding an exception.

Booking products cannot be combined with regular products in one product (FAQ: "لا، لأن منتج الحجز منفصل"). Whether a cart can hold a booking product together with physical products is NOT DOCUMENTED in this article.

### How a customer books (storefront)

From the same FAQ: (1) on the product the customer presses "احجز الآن" (Book now); (2) a table of available appointments appears where the customer chooses the number of seats, date and time and presses "إكمال الحجز" (complete booking); (3) after successful payment a message shows the order number and an email field for the invoice. The article says the schedule "appears to your customers on the checkout page" ("ستظهر لعملائك في صفحة إنهاء الطلب"), so slot selection happens inside Salla's checkout, not on the product page.

