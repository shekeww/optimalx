
## 5. Branch page (المدينة المنورة, فرع الخالدية)

Sources: keywords-ar.md L01 (H1 and title verbatim; the local note says the cluster is won by the Google Business Profile plus a branch page with the national address, hours and a map), FINAL-claims-source.md section 6 (public address and coordinates 24.46276125, 39.653138015), BUILD.md section 5 (branch page gated on P0: address fields and real hours are null today and `salla-order-branch` prints whatever is there). New placeholders introduced here: {HOURS_WEEKDAY} {HOURS_FRIDAY} {HOURS_SATURDAY} {HOURS_RAMADAN} {LANDMARK} {PICKUP_READY_HOURS} {PICKUP_HOLD_DAYS}.

- Slug: branch/medina
- H1: مكملات غذائية في المدينة المنورة: فرع الخالدية
- Title: مكملات غذائية في المدينة المنورة | اوبتيمال اكس
- English H1 / title: Supplements in Madinah: Al Khalidiyah Branch / Supplement Store in Madinah | OptimalX (body copy uses Madinah once and Medina once, per keywords section 6)

### 5.1 Intro (59 words)

فرعنا الوحيد في حي الخالدية بالمدينة المنورة، على شارع جبار بن صخر. نبيع فيه ما نبيعه في المتجر الإلكتروني بالأسعار نفسها، ويستطيع من في المدينة استلام طلبه من الفرع مجانا بدل انتظار الشحن. من يستقبلك في الفرع هو الفريق نفسه الذي يرد على الأسئلة المكتوبة، فاسأل ما شئت عن الاختيار والاستخدام. المتجر جديد والفرع صغير، والعنوان وساعات العمل أدناه.

### 5.2 What you can do at the branch

| # | Title | Line |
|---|---|---|
| 1 | استلام طلبك الإلكتروني | اختر الاستلام من الفرع عند إتمام الطلب، ويصلك تنبيه عندما يكون جاهزا. |
| 2 | مقارنة الأحجام والنكهات | العبوات أمامك على الرف، فقارن وزن السكوب وعدد الحصص بنفسك. |
| 3 | الشراء والدفع في الفرع | بمدى أو أبل باي أو نقدا، بالأسعار نفسها المعروضة في المتجر. |
| 4 | سؤال فريق الفرع | عن الاختيار وطريقة الاستخدام وقراءة الملصق. لا نقدم استشارة صحية. |
| 5 | حجز وقت للزيارة | اختياري. يضمن أن يكون أحدنا متفرغا لك وطلبك جاهزا. |

Payment marks gate: methods render after the P0 payment confirmation (BUILD.md section 1).

### 5.3 Hours table

Table title: ساعات العمل

| Label | Value |
|---|---|
| Column heads | اليوم · من · إلى |
| الأحد إلى الخميس | {HOURS_WEEKDAY} |
| الجمعة | {HOURS_FRIDAY} (يبدأ بعد صلاة العصر) |
| السبت | {HOURS_SATURDAY} |
| رمضان | {HOURS_RAMADAN} |
| Note line | نغلق وقت الصلاة ونعود بعدها. |
| Status chip (live) | مفتوح الآن · مغلق الآن · يفتح الساعة {NEXT_OPEN} |

Rule: the table renders only when the dashboard branch record carries real hours; a default-hours record must not print.

### 5.4 Pickup steps

Title: كيف تستلم طلبك من الفرع

1. اختر "الاستلام من الفرع" في صفحة الدفع. لا رسوم شحن.
2. انتظر رسالة "طلبك جاهز" على جوالك، وتصل عادة خلال {PICKUP_READY_HOURS} ساعة عمل.
3. أحضر رقم الطلب على جوالك، ولا حاجة إلى طباعة.
4. استلمه خلال {PICKUP_HOLD_DAYS} أيام. بعدها نعيد المبلغ بالطريقة التي دفعت بها ونعيد المنتج إلى الرف.

Line under the steps: تأخرت لسبب ما؟ راسلنا على واتساب ونمدد لك المدة.

### 5.5 WhatsApp CTA

- Button: راسلنا على واتساب
- Line under the button: للأسئلة السريعة عن التوفر أو الاستلام. نرد خلال ساعات العمل، وخارجها في اليوم التالي.
- Prefilled message: السلام عليكم، عندي سؤال عن فرع الخالدية.
- Gate: the number lives on the branch record, not the store (BUILD.md section 5, P0).

### 5.6 Directions line

على شارع جبار بن صخر في حي الخالدية، {LANDMARK}. مواقف مجانية على الشارع. افتح الموقع في خرائط جوجل: {MAP_URL}.

Map embed alt text: خريطة تظهر موقع فرع اوبتيمال اكس في حي الخالدية بالمدينة المنورة.

### 5.7 FAQ

- Q: هل الأسعار في الفرع هي نفسها في المتجر الإلكتروني؟
  - A: نعم. السعر نفسه شامل الضريبة، والعروض نفسها. الفرق الوحيد أن الاستلام من الفرع مجاني، بينما الشحن له رسومه تحت 299 ريالا. ما يظهر متوفرا في المتجر الإلكتروني هو مخزون الفرع نفسه، فلا تختلف التشكيلة بين المكانين.
- Q: هل أستطيع الشراء من الفرع مباشرة بلا طلب إلكتروني؟
  - A: نعم. تعال في ساعات العمل واشتريمباشرة وادفع في الفرع. الطلب الإلكتروني مع الاستلام من الفرع يفيدك إن أردت أن يكون المنتج محجوزا باسمك وجاهزا عند وصولك، أو إن كان طلبك يحوي أكثر من منتج.
- Q: كم يبقى الطلب محجوزا في الفرع؟
  - A: {PICKUP_HOLD_DAYS} أيام من رسالة "طلبك جاهز". إن لم تستلمه خلالها نعيد المبلغ بالطريقة التي دفعت بها ونعيد المنتج إلى الرف. إن تأخرت لسبب ما فراسلنا على واتساب قبل انتهاء المدة ونمددها لك.

### 5.8 Local SEO note (not copy)

The page carries LocalBusiness structured data with the national address, the coordinates above, the hours table and the phone. "قريب مني" and "أقرب" queries are answered by the Google Business Profile, which must carry the same address, hours and photos as this page.

---

