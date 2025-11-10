// Export utilities for PDF and Excel generation

interface Transaction {
  id: string;
  customerId: string;
  type: string;
  status: string;
  reservationDate?: string;
  completionDate?: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: number;
    color: string;
  };
  pricing: {
    vehiclePrice: number;
    taxes: number;
    fees: number;
    discount: number;
    totalAmount: number;
  };
  totalPaid: number;
  balanceRemaining: number;
  currency: string;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  currency: string;
}

// Format currency
const formatCurrency = (amount: number, currency: string = 'LKR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Export to CSV (which can be opened in Excel)
export const exportToExcel = (
  data: Transaction[] | Expense[],
  filename: string,
  reportType: 'sales' | 'expenses' | 'profit' | 'transactions'
) => {
  let csvContent = '';
  
  if (reportType === 'sales' || reportType === 'transactions') {
    // Sales/Transaction CSV headers
    csvContent = 'Date,Transaction ID,Type,Customer ID,Vehicle,Status,Total Amount,Paid,Balance,Currency\n';
    
    (data as Transaction[]).forEach(item => {
      const date = item.completionDate || item.reservationDate || '';
      const vehicle = `${item.vehicleDetails.brand} ${item.vehicleDetails.model} (${item.vehicleDetails.year})`;
      const row = [
        date,
        item.id,
        item.type,
        item.customerId,
        vehicle,
        item.status,
        item.pricing.totalAmount,
        item.totalPaid,
        item.balanceRemaining,
        item.currency
      ].join(',');
      csvContent += row + '\n';
    });
  } else if (reportType === 'expenses') {
    // Expenses CSV headers
    csvContent = 'Date,Expense ID,Category,Description,Amount,Currency\n';
    
    (data as Expense[]).forEach(item => {
      const row = [
        item.date,
        item.id,
        item.category,
        `"${item.description}"`, // Quote description to handle commas
        item.amount,
        item.currency
      ].join(',');
      csvContent += row + '\n';
    });
  }

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF
export const exportToPDF = (
  data: Transaction[] | Expense[],
  filename: string,
  reportType: 'sales' | 'expenses' | 'profit' | 'transactions',
  summary?: {
    totalRevenue?: number;
    totalExpenses?: number;
    totalProfit?: number;
    count?: number;
  }
) => {
  // Create HTML content for PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #667eea;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #667eea;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .summary {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-around;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item h3 {
          margin: 0;
          color: #667eea;
          font-size: 24px;
        }
        .summary-item p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 11px;
        }
        tr:hover {
          background: #f8f9fa;
        }
        .text-right {
          text-align: right;
        }
        .total-row {
          background: #f0f0f0;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          color: #666;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 Moder Car Sale</h1>
        <p>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
  `;

  // Add summary if provided
  if (summary) {
    htmlContent += '<div class="summary">';
    if (summary.totalRevenue !== undefined) {
      htmlContent += `
        <div class="summary-item">
          <h3>${formatCurrency(summary.totalRevenue)}</h3>
          <p>Total Revenue</p>
        </div>
      `;
    }
    if (summary.totalExpenses !== undefined) {
      htmlContent += `
        <div class="summary-item">
          <h3>${formatCurrency(summary.totalExpenses)}</h3>
          <p>Total Expenses</p>
        </div>
      `;
    }
    if (summary.totalProfit !== undefined) {
      htmlContent += `
        <div class="summary-item">
          <h3 style="color: ${summary.totalProfit >= 0 ? '#27ae60' : '#e74c3c'}">${formatCurrency(summary.totalProfit)}</h3>
          <p>Net Profit</p>
        </div>
      `;
    }
    if (summary.count !== undefined) {
      htmlContent += `
        <div class="summary-item">
          <h3>${summary.count}</h3>
          <p>Total Records</p>
        </div>
      `;
    }
    htmlContent += '</div>';
  }

  // Add table
  if (reportType === 'sales' || reportType === 'transactions') {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>ID</th>
            <th>Type</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalAmount = 0;
    (data as Transaction[]).forEach(item => {
      const date = new Date(item.completionDate || item.reservationDate || '').toLocaleDateString();
      const vehicle = `${item.vehicleDetails.brand} ${item.vehicleDetails.model}`;
      totalAmount += item.pricing.totalAmount;
      
      htmlContent += `
        <tr>
          <td>${date}</td>
          <td>${item.id}</td>
          <td>${item.type}</td>
          <td>${vehicle}</td>
          <td>${item.status}</td>
          <td class="text-right">${formatCurrency(item.pricing.totalAmount, item.currency)}</td>
        </tr>
      `;
    });

    htmlContent += `
          <tr class="total-row">
            <td colspan="5">TOTAL</td>
            <td class="text-right">${formatCurrency(totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (reportType === 'expenses') {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>ID</th>
            <th>Category</th>
            <th>Description</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalAmount = 0;
    (data as Expense[]).forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      totalAmount += item.amount;
      
      htmlContent += `
        <tr>
          <td>${date}</td>
          <td>${item.id}</td>
          <td>${item.category}</td>
          <td>${item.description}</td>
          <td class="text-right">${formatCurrency(item.amount, item.currency)}</td>
        </tr>
      `;
    });

    htmlContent += `
          <tr class="total-row">
            <td colspan="4">TOTAL</td>
            <td class="text-right">${formatCurrency(totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  htmlContent += `
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Moder Car Sale - Advanced Accounting System</p>
        <p>Powered by NextWave Tech Labs</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      // Close after print dialog is dismissed
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };
  }
};


