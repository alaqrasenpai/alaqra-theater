# 🎬 Alaqra Theater (المسرح الشخصي)

منصة بث وتشغيل سينمائية شخصية خالية من الإعلانات ومن قواعد البيانات، تعتمد بالكامل على التخزين المحلي للمتصفح (Database-less / LocalStorage)، وتدعم تقسيم حلقات المسلسلات، وجلب الترجمات العربية تلقائياً، وقنوات الاستوديوهات على غرار YouTube، وبث الأنمي بالصوت الياباني الأصلي.

---

## ✨ المميزات الرئيسية (Features)

- **🚫 خالٍ تماماً من الإعلانات وقواعد البيانات (Ad-free & Database-less)**:
  - لا حاجة لتثبيت قاعدة بيانات خارجية أو تسجيل دخول؛ يتم حفظ سجل المشاهدة والتفضيلات مباشرة في المتصفح.
- **🎥 مشغل سينمائي على غرار YouTube (YouTube-Style Player)**:
  - واجهة تحكم متطورة، شارات جودة تفاعلية (Auto HD حتى 1080p)، وبث مباشر سريع.
- **⚡ سيرفرات بث متعددة (Multi-Server Streaming)**:
  - **سيرفر 1 (سريع • ترجمة مدمجة)**: استجابة فائقة السرعة مع ترجمة فورية على الشاشة.
  - **سيرفر 2 (جودة فائقة 1080p FHD)**: سيرفر عالي الجودة بمعدل بت مرتفع.
  - **سيرفر 3 (بديل Multi)**: سيرفر احتياطي متعدد المصادر.
  - **بث التورنت (P2P 1080p خام)**: تشغيل مباشر لملفات التورنت الأصلية غير المضغوطة.
- **💬 ترجمة عربية وإنجليزية تلقائية (Automatic Subtitles)**:
  - جلب وتطبيق ملفات الترجمة مباشرة من OpenSubtitles مع إمكانية رفع ملفات `.srt` محلياً.
- **📺 تقسيم مواسم وحلقات المسلسلات والأنمي (TV & Anime Episode Navigator)**:
  - تصفح واختيار سلس لكافة المواسم والحلقات بنقرة واحدة.
- **🇯🇵 قسم أنمي متكامل بصوت ياباني أصلي**:
  - ضبط تلقائي للصوت الياباني مع الترجمة العربية المدمجة.
- **🏷️ قنوات واستوديوهات الإنتاج (Studio Channels)**:
  - تصنيف الأفلام والمسلسلات تحت استوديوهات عالمية موثقة (مثل Marvel Studios, DC Studios, Studio Ghibli, Warner Bros, Anime Studios).
- **🌐 واجهة ثنائية اللغة (Bilingual UI)**:
  - دعم كامل للغتين العربية والإنجليزية بتبديل فوري.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend**:
  - [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lucide Icons](https://lucide.dev/)
  - [Axios](https://axios-http.com/)
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [WebTorrent](https://webtorrent.io/) (لبث التورنت المباشر)
  - تكامل مع واجهات TVMaze و OpenSubtitles و YTS

---

## 🚀 التشغيل المحلي (Quick Start)

### 1. المتطلبات الأساسية
- تثبيت [Node.js](https://nodejs.org/) (الإصدار 18 أو أحدث).

### 2. تثبيت الحزم
```bash
# تثبيت حزم الواجهة الخلفية
cd backend
npm install

# تثبيت حزم الواجهة الأمامية
cd ../frontend
npm install
```

### 3. تشغيل المشروع
- **تشغيل خادم الخلفية (Backend)**:
  ```bash
  cd backend
  node server.js
  # يعمل على المنفذ 3001
  ```
- **تشغيل الواجهة الأمامية (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  # يعمل على http://localhost:5173
  ```

---

## 👨‍💻 المطور (Developer)

تمت البرمجة والتطوير بواسطة **[alaqra.dev](https://alaqra.dev)**
GitHub: [@alaqrasenpai](https://github.com/alaqrasenpai)
