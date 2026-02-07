import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface User {
  id: number;
  name: string;
  mobile_no: string;
  instruction: string | null;
  status: string;
  feedback: string | null;
  assigned_to: string;
  tag: string;
  priority: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export const exportToCSV = async (users: User[], filename: string) => {
  const headers = ['ID', 'Name', 'Mobile No', 'Status', 'Priority', 'Assigned To', 'Feedback', 'Instruction', 'Tag', 'Created At', 'Updated At'];
  
  const rows = users.map(user => [
    user.id,
    user.name,
    user.mobile_no,
    user.status,
    user.priority,
    user.assigned_to,
    user.feedback || '',
    user.instruction || '',
    user.tag,
    new Date(user.created_at).toLocaleString(),
    new Date(user.updated_at).toLocaleString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const fileUri = FileSystem.documentDirectory + `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent);
  await Sharing.shareAsync(fileUri);
};
