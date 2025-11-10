# Moder Car Sale - Advanced Accounting System

<div align="center">

**🚗 Professional Car Sales Management System**

**Developed with ❤️ by [NextWave Tech Labs](https://nextwavetech.com)**

*Innovative Software Solutions for Modern Businesses*

</div>

A comprehensive React TypeScript application for managing car sales, inventory, expenses, and financial reporting for automotive businesses importing vehicles from international markets.

## 🚗 Features

### Core Functionality
- **Vehicle Order Management**: Track orders from Japan, Germany, USA, and other countries
- **Comprehensive Expense Tracking**: Monitor all costs including:
  - Vehicle purchase cost
  - Fuel expenses
  - Import duties
  - Driver charges
  - Clearance charges
  - Demurrage fees
  - Taxes
  - CNO (Certificate of No Objection) costs
  - CIF (Cost, Insurance, and Freight) values
- **Multi-Currency Support**: Handle transactions in USD, JPY, EUR, and GBP
- **Real-time Status Tracking**: Monitor order progress from placement to completion
- **Profit Analysis**: Automatic calculation of profit margins and financial metrics
- **Asset Management**: Track total inventory value and vehicle stock
- **Monthly Reporting**: Generate comprehensive financial reports

### Advanced Features
- **Payment Method Tracking**: Support for various payment methods including bank transfers, letters of credit, cash, and checks
- **Document Management**: Track important documents like CNO and CIF certificates
- **Currency Status Monitoring**: Real-time currency conversion and status updates
- **Professional Dashboard**: Intuitive interface with key performance indicators
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices

## 🛠 Technology Stack

- **Frontend**: React 19.1.1 with TypeScript
- **Build Tool**: React Scripts (Create React App)
- **Styling**: Custom CSS with modern design patterns
- **State Management**: React Hooks (useState, useEffect)
- **Development**: Hot reload development server

## 📋 System Requirements

- Node.js (v16 or higher)
- npm (v8 or higher)
- Modern web browser

## 🚀 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd moder-car-sale
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Usage Guide

### Dashboard Overview
The main dashboard provides:
- **Key Metrics**: Total assets, profit, completed orders, and pending orders
- **Recent Orders**: Quick view of latest vehicle orders
- **Quick Actions**: Shortcuts to common tasks

### Vehicle Order Management
- Create new vehicle orders with comprehensive details
- Track order status through different stages:
  - **Ordered**: Initial order placed
  - **Shipped**: Vehicle in transit
  - **Clearing**: Going through customs
  - **Completed**: Ready for sale
- Monitor all associated costs and expenses

### Expense Tracking
- Record and categorize all expenses related to vehicle imports
- Track fuel costs, duties, driver charges, and clearance fees
- Monitor demurrage payments and tax obligations
- Manage CNO and CIF documentation costs

### Reporting System
- Generate monthly financial reports
- Analyze profit margins and cost breakdowns
- Export reports in PDF format
- Track performance metrics over time

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Optimized for all screen sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Color-Coded Status**: Visual indicators for order status and payment states
- **Card-Based Layout**: Organized information in easy-to-read cards

## 🔧 Available Scripts

- **`npm start`**: Runs the development server
- **`npm build`**: Creates production build
- **`npm test`**: Runs test suite
- **`npm eject`**: Ejects from Create React App (not recommended)

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard component
│   ├── Dashboard.css          # Dashboard styling
│   ├── Header.tsx             # Navigation header
│   ├── Header.css             # Header styling
│   ├── VehicleOrderForm.tsx   # New order form
│   └── VehicleOrderForm.css   # Form styling
├── App.tsx                    # Main application component
├── App.css                    # Global application styles
└── index.tsx                  # Application entry point
```

## 💼 Business Logic

### Order Status Flow
1. **Ordered**: Vehicle order placed with supplier
2. **Shipped**: Vehicle dispatched from origin country
3. **Clearing**: Vehicle going through customs and documentation
4. **Completed**: Vehicle cleared and ready for local sale

### Cost Calculation
Total Cost = Vehicle Cost + Fuel + Duty + Driver Charge + Clearance Charge + Demurrage + Tax + CNO + CIF

### Profit Calculation
Profit = Selling Price - Total Cost

## 🌍 International Support

- **Multi-Country Support**: Import from Japan, Germany, USA, UK, South Korea
- **Currency Handling**: USD, JPY, EUR, GBP with automatic formatting
- **International Documentation**: CNO and CIF certificate tracking
- **Customs Integration**: Built-in support for customs clearance tracking

## 📈 Analytics & Reporting

- **Real-time Metrics**: Live updates of key performance indicators
- **Profit Margin Analysis**: Detailed breakdown of profitability
- **Monthly Reports**: Comprehensive financial summaries
- **Asset Tracking**: Current inventory value and stock levels
- **Performance Trends**: Historical data analysis

## 🔒 Security Features

- **Input Validation**: Comprehensive form validation
- **Data Sanitization**: Clean and secure data handling
- **Type Safety**: Full TypeScript implementation for type safety

## 🎯 Future Enhancements

- Backend API integration
- Database connectivity
- User authentication system
- Advanced reporting with charts
- Email notifications
- Document upload functionality
- Advanced search and filtering
- Data export capabilities

## 🏢 About NextWave Tech Labs

<div align="center">

**NextWave Tech Labs** - *Innovative Software Solutions*

We specialize in creating cutting-edge software solutions for modern businesses. Our expertise includes:

🌐 **Web Applications** | 📱 **Mobile Apps** | ☁️ **Cloud Solutions** | 🤖 **AI Integration**

💼 **Enterprise Systems** | 🛒 **E-commerce Platforms** | 📊 **Business Analytics** | 🔒 **Security Solutions**

</div>

### 🚀 Our Services

- **Custom Software Development**: Tailored solutions for your unique business needs
- **Enterprise Applications**: Scalable systems for large organizations  
- **E-commerce Solutions**: Complete online business platforms
- **Mobile App Development**: iOS and Android applications
- **Cloud Integration**: Modern cloud-based architectures
- **UI/UX Design**: Beautiful and intuitive user interfaces
- **Maintenance & Support**: Ongoing technical support and updates

### 🎯 Why Choose NextWave Tech Labs?

✅ **Expert Team**: Experienced developers and designers  
✅ **Modern Technology**: Latest tools and frameworks  
✅ **Quality Assurance**: Rigorous testing and optimization  
✅ **Client-Focused**: Your success is our priority  
✅ **Ongoing Support**: Long-term partnership approach  

## 👥 Contact & Support

**Ready to transform your business with innovative software?**

📧 **Email**: [contact@nextwavetech.com](mailto:contact@nextwavetech.com)  
🌐 **Website**: [www.nextwavetech.com](https://nextwavetech.com)  
📞 **Phone**: +1 (555) 123-NEXT  
💬 **WhatsApp**: Available for consultation  

### 🤝 Get Your Custom Solution

Contact NextWave Tech Labs today to discuss your software development needs. We create solutions that drive business growth and efficiency.

## 📄 License

This project is proprietary software developed by **NextWave Tech Labs** for **Moder Car Sale**.  
Unauthorized copying, modification, or distribution is strictly prohibited.

---

<div align="center">

**© 2024 NextWave Tech Labs. All rights reserved.**

*Proudly developing the future of business software* 🚀

**Follow us for updates on innovative software solutions!**

</div>
