import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface Cabinet {
  id: string;
  lastName: string;
  firstName: string;
  cabinet: string;
  totalRevenue: number;
  dailyRevenue: number;
  balance: number;
  dealsBeforeMidnight: number;
  dealsAfterMidnight: number;
  date: string;
}

const Index = () => {
  const { toast } = useToast();
  const [cabinets, setCabinets] = useState<Cabinet[]>([
    {
      id: '1',
      lastName: 'Иванов',
      firstName: 'Петр',
      cabinet: 'Кабинет А',
      totalRevenue: 150000,
      dailyRevenue: 5000,
      balance: 45000,
      dealsBeforeMidnight: 12,
      dealsAfterMidnight: 8,
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      lastName: 'Смирнова',
      firstName: 'Анна',
      cabinet: 'Кабинет Б',
      totalRevenue: 220000,
      dailyRevenue: 7500,
      balance: 68000,
      dealsBeforeMidnight: 18,
      dealsAfterMidnight: 5,
      date: new Date().toISOString().split('T')[0]
    }
  ]);

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    cabinet: '',
    totalRevenue: '',
    balance: '',
    dealsBeforeMidnight: '',
    dealsAfterMidnight: ''
  });

  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingCabinetId, setDeletingCabinetId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDailyRevenue = (totalRevenue: number): number => {
    const previousDay = cabinets.find(c => c.cabinet === formData.cabinet)?.totalRevenue || 0;
    return totalRevenue - previousDay;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalRevenue = parseFloat(formData.totalRevenue);
    const dailyRevenue = calculateDailyRevenue(totalRevenue);
    
    const newCabinet: Cabinet = {
      id: Date.now().toString(),
      lastName: formData.lastName,
      firstName: formData.firstName,
      cabinet: formData.cabinet,
      totalRevenue,
      dailyRevenue,
      balance: parseFloat(formData.balance),
      dealsBeforeMidnight: parseInt(formData.dealsBeforeMidnight),
      dealsAfterMidnight: parseInt(formData.dealsAfterMidnight),
      date: new Date().toISOString().split('T')[0]
    };

    setCabinets([...cabinets, newCabinet]);
    setFormData({
      lastName: '',
      firstName: '',
      cabinet: '',
      totalRevenue: '',
      balance: '',
      dealsBeforeMidnight: '',
      dealsAfterMidnight: ''
    });

    toast({
      title: 'Успешно добавлено',
      description: `Кабинет ${formData.cabinet} добавлен в систему`
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(cabinets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Статистика кабинетов');
    XLSX.writeFile(workbook, `statistics_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Экспорт завершён',
      description: 'Файл Excel успешно сохранён'
    });
  };

  const handleEdit = (cabinet: Cabinet) => {
    setEditingCabinet(cabinet);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingCabinet) {
      setCabinets(cabinets.map(c => c.id === editingCabinet.id ? editingCabinet : c));
      setIsEditDialogOpen(false);
      setEditingCabinet(null);
      toast({
        title: 'Успешно обновлено',
        description: `Кабинет ${editingCabinet.cabinet} обновлён`
      });
    }
  };

  const handleDelete = (id: string) => {
    setCabinets(cabinets.filter(c => c.id !== id));
    setDeletingCabinetId(null);
    toast({
      title: 'Успешно удалено',
      description: 'Кабинет удалён из системы'
    });
  };

  const updateEditingCabinet = (field: keyof Cabinet, value: string | number) => {
    if (editingCabinet) {
      setEditingCabinet({ ...editingCabinet, [field]: value });
    }
  };

  const totalStats = {
    totalRevenue: cabinets.reduce((sum, c) => sum + c.totalRevenue, 0),
    totalBalance: cabinets.reduce((sum, c) => sum + c.balance, 0),
    totalDeals: cabinets.reduce((sum, c) => sum + c.dealsBeforeMidnight + c.dealsAfterMidnight, 0),
    averageDailyRevenue: cabinets.reduce((sum, c) => sum + c.dailyRevenue, 0) / cabinets.length || 0
  };

  const chartData = cabinets.map(c => ({
    name: c.cabinet,
    'Оборот': c.totalRevenue,
    'Баланс': c.balance,
    'Дневной оборот': c.dailyRevenue
  }));

  const dealsChartData = cabinets.map(c => ({
    name: c.cabinet,
    'До 00:00': c.dealsBeforeMidnight,
    'После 00:00': c.dealsAfterMidnight
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Панель управления</h1>
            <p className="text-muted-foreground">Система учёта статистики кабинетов</p>
          </div>
          <Button onClick={exportToExcel} size="lg" className="gap-2">
            <Icon name="Download" size={20} />
            Экспорт в Excel
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="dashboard">
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="cabinets">
              <Icon name="Building2" size={16} className="mr-2" />
              Кабинеты
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общий оборот</CardTitle>
                  <Icon name="DollarSign" className="text-primary" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.totalRevenue.toLocaleString()} ₽</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Всего по {cabinets.length} кабинетам
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средний дневной оборот</CardTitle>
                  <Icon name="TrendingUp" className="text-primary" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.averageDailyRevenue.toLocaleString()} ₽</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    В среднем за день
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общий баланс</CardTitle>
                  <Icon name="Wallet" className="text-primary" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.totalBalance.toLocaleString()} ₽</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    На всех счетах
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего сделок</CardTitle>
                  <Icon name="Activity" className="text-primary" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.totalDeals}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    За текущий период
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Финансовые показатели</CardTitle>
                  <CardDescription>Оборот, баланс и дневной оборот по кабинетам</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="Оборот" fill="#9b87f5" />
                      <Bar dataKey="Баланс" fill="#7E69AB" />
                      <Bar dataKey="Дневной оборот" fill="#D6BCFA" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Распределение сделок</CardTitle>
                  <CardDescription>Количество сделок до и после 00:00 МСК</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dealsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="До 00:00" stroke="#9b87f5" strokeWidth={2} />
                      <Line type="monotone" dataKey="После 00:00" stroke="#D6BCFA" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cabinets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Добавить новый кабинет</CardTitle>
                <CardDescription>Введите данные для нового кабинета</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cabinet">Кабинет</Label>
                      <Input
                        id="cabinet"
                        name="cabinet"
                        value={formData.cabinet}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalRevenue">Оборот кабинета (₽)</Label>
                      <Input
                        id="totalRevenue"
                        name="totalRevenue"
                        type="number"
                        value={formData.totalRevenue}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="balance">Баланс (₽)</Label>
                      <Input
                        id="balance"
                        name="balance"
                        type="number"
                        value={formData.balance}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealsBeforeMidnight">Сделки до 00:00 МСК</Label>
                      <Input
                        id="dealsBeforeMidnight"
                        name="dealsBeforeMidnight"
                        type="number"
                        value={formData.dealsBeforeMidnight}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealsAfterMidnight">Сделки после 00:00 МСК</Label>
                      <Input
                        id="dealsAfterMidnight"
                        name="dealsAfterMidnight"
                        type="number"
                        value={formData.dealsAfterMidnight}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить кабинет
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Список кабинетов</CardTitle>
                <CardDescription>Все зарегистрированные кабинеты</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ФИО</TableHead>
                      <TableHead>Кабинет</TableHead>
                      <TableHead className="text-right">Оборот</TableHead>
                      <TableHead className="text-right">Дневной оборот</TableHead>
                      <TableHead className="text-right">Баланс</TableHead>
                      <TableHead className="text-right">Сделки (до/после)</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cabinets.map((cabinet) => (
                      <TableRow key={cabinet.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {cabinet.lastName} {cabinet.firstName}
                        </TableCell>
                        <TableCell>{cabinet.cabinet}</TableCell>
                        <TableCell className="text-right">{cabinet.totalRevenue.toLocaleString()} ₽</TableCell>
                        <TableCell className="text-right text-primary">
                          +{cabinet.dailyRevenue.toLocaleString()} ₽
                        </TableCell>
                        <TableCell className="text-right">{cabinet.balance.toLocaleString()} ₽</TableCell>
                        <TableCell className="text-right">
                          {cabinet.dealsBeforeMidnight} / {cabinet.dealsAfterMidnight}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(cabinet)}
                            >
                              <Icon name="Pencil" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingCabinetId(cabinet.id)}
                            >
                              <Icon name="Trash2" size={16} className="text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Детальная статистика</CardTitle>
                  <CardDescription>Полная информация по всем кабинетам</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cabinets.map((cabinet) => (
                    <div key={cabinet.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {cabinet.cabinet} - {cabinet.lastName} {cabinet.firstName}
                        </h3>
                        <span className="text-sm text-muted-foreground">{cabinet.date}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Общий оборот</p>
                          <p className="text-lg font-bold">{cabinet.totalRevenue.toLocaleString()} ₽</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Дневной оборот</p>
                          <p className="text-lg font-bold text-primary">+{cabinet.dailyRevenue.toLocaleString()} ₽</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Баланс банка</p>
                          <p className="text-lg font-bold">{cabinet.balance.toLocaleString()} ₽</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Сделки</p>
                          <p className="text-lg font-bold">
                            {cabinet.dealsBeforeMidnight + cabinet.dealsAfterMidnight}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <Icon name="Clock" size={16} className="text-muted-foreground" />
                          <span className="text-sm">До 00:00: {cabinet.dealsBeforeMidnight}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Moon" size={16} className="text-muted-foreground" />
                          <span className="text-sm">После 00:00: {cabinet.dealsAfterMidnight}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Редактировать кабинет</DialogTitle>
              <DialogDescription>
                Внесите изменения в данные кабинета
              </DialogDescription>
            </DialogHeader>
            {editingCabinet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Фамилия</Label>
                  <Input
                    id="edit-lastName"
                    value={editingCabinet.lastName}
                    onChange={(e) => updateEditingCabinet('lastName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Имя</Label>
                  <Input
                    id="edit-firstName"
                    value={editingCabinet.firstName}
                    onChange={(e) => updateEditingCabinet('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cabinet">Кабинет</Label>
                  <Input
                    id="edit-cabinet"
                    value={editingCabinet.cabinet}
                    onChange={(e) => updateEditingCabinet('cabinet', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-totalRevenue">Оборот кабинета (₽)</Label>
                  <Input
                    id="edit-totalRevenue"
                    type="number"
                    value={editingCabinet.totalRevenue}
                    onChange={(e) => updateEditingCabinet('totalRevenue', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dailyRevenue">Дневной оборот (₽)</Label>
                  <Input
                    id="edit-dailyRevenue"
                    type="number"
                    value={editingCabinet.dailyRevenue}
                    onChange={(e) => updateEditingCabinet('dailyRevenue', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-balance">Баланс (₽)</Label>
                  <Input
                    id="edit-balance"
                    type="number"
                    value={editingCabinet.balance}
                    onChange={(e) => updateEditingCabinet('balance', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dealsBeforeMidnight">Сделки до 00:00 МСК</Label>
                  <Input
                    id="edit-dealsBeforeMidnight"
                    type="number"
                    value={editingCabinet.dealsBeforeMidnight}
                    onChange={(e) => updateEditingCabinet('dealsBeforeMidnight', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dealsAfterMidnight">Сделки после 00:00 МСК</Label>
                  <Input
                    id="edit-dealsAfterMidnight"
                    type="number"
                    value={editingCabinet.dealsAfterMidnight}
                    onChange={(e) => updateEditingCabinet('dealsAfterMidnight', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveEdit}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deletingCabinetId !== null} onOpenChange={() => setDeletingCabinetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить этот кабинет? Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletingCabinetId && handleDelete(deletingCabinetId)}>
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Index;