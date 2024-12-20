"use client";

import React, { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: number;
  nombre: string;
  email: string;
  rut?: string;
  fecha_actualizacion: string;
}

const Page: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching Users...");
      setLoading(true);
      const response = await fetch('http://localhost:3100/usuarios');
      if (!response.ok) throw new Error('Error fetching users');
      const data = await response.json();
      setUsers(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handlePasswordClick = (user: User) => {
    setCurrentUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleSave = async () => {
    if (!currentUser) return;
  
    setSaving(true);
    setErrorMessage(null);
  
    try {
      const response = await fetch(`http://localhost:3100/usuarios/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentUser),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Error al guardar el usuario');
        throw new Error(errorData.error || 'Error al guardar el usuario');
      }
  
      await response.json(); // No necesitas el `updatedUser` si vuelves a llamar a fetchUsers
      await fetchUsers(); // Recargar la lista de usuarios
      handleCloseModal();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordChange = async () => {
    if (!currentUser || !newPassword) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`http://localhost:3100/usuarios/password/${currentUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clave: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error al cambiar la contraseña");
        throw new Error(errorData.error || "Error al cambiar la contraseña");
      }

      await response.json();
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setNewPassword("");
    setCurrentUser(null);
  };

  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Toor</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Funcionarios</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
       <div>
       <Button>Nuevo Usuario</Button>
       </div>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}

          {!loading && !error && (
            <Table>
              
              <TableCaption>Listado de usuarios registrados.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                        <Button className="mr-2" onClick={() => handleEditClick(user)}>Editar</Button>
                        <Button onClick={() => handlePasswordClick(user)}>Password</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SidebarInset>

      {isModalOpen && currentUser && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="id">ID</Label>
                  <Input id="id" name="id" value={currentUser.id} disabled />
                </div>
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={currentUser.nombre}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={currentUser.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    value={currentUser.rut || ''}
                    onChange={handleInputChange}
                  />
                </div>

              </div>
            </form>
            {errorMessage && (
        <div className="text-red-500 mt-4">
          <p>{errorMessage}</p>
        </div>
      )}
            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

{isPasswordModalOpen && currentUser && (
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <DialogFooter>
              <Button variant="secondary" onClick={handleClosePasswordModal}>
                Cancelar
              </Button>
              <Button onClick={handlePasswordChange} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      
    </>
  );
};

export default Page;
