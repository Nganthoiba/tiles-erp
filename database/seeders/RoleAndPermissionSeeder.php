<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Users\Models\Permission;
use App\Modules\Users\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Define Permissions
        $permissions = [
            'view-dashboard'   => 'Access Dashboard stats and metrics',
            'manage-products'  => 'Create, edit, view, delete products & categories',
            'manage-inventory' => 'Receive, transfer, adjust stock and view stock ledger',
            'create-quotations'=> 'Create, edit, and print quotations',
            'create-invoices'  => 'Create, view and print sales invoices',
            'record-payments'  => 'Record and edit invoice collections/payments',
            'manage-deliveries'=> 'Create and track delivery slips',
            'view-reports'     => 'Access sales, inventory, and due reports',
            'view-audit-logs'  => 'View activity logs',
            'manage-users'     => 'Administer users, roles, and settings',
        ];

        $permissionModels = [];
        foreach ($permissions as $slug => $name) {
            $permissionModels[$slug] = Permission::create([
                'name' => $name,
                'slug' => $slug,
            ]);
        }

        // 2. Define Roles
        $roles = [
            'admin'     => 'System Administrator',
            'manager'   => 'Store Manager',
            'sales'     => 'Sales executive',
            'warehouse' => 'Warehouse operator',
            'accounts'  => 'Accounts officer',
            'delivery'  => 'Delivery coordinator',
        ];

        $roleModels = [];
        foreach ($roles as $slug => $name) {
            $roleModels[$slug] = Role::create([
                'name' => $name,
                'slug' => $slug,
            ]);
        }

        // 3. Assign Permissions to Roles
        // Admin gets everything
        $roleModels['admin']->permissions()->sync(array_values(array_map(fn($m) => $m->id, $permissionModels)));

        // Manager gets everything except manage-users
        $managerPerms = array_filter($permissionModels, fn($slug) => $slug !== 'manage-users', ARRAY_FILTER_USE_KEY);
        $roleModels['manager']->permissions()->sync(array_values(array_map(fn($m) => $m->id, $managerPerms)));

        // Sales
        $salesPerms = [
            $permissionModels['view-dashboard']->id,
            $permissionModels['create-quotations']->id,
            $permissionModels['create-invoices']->id,
            $permissionModels['record-payments']->id,
            $permissionModels['manage-deliveries']->id,
        ];
        $roleModels['sales']->permissions()->sync($salesPerms);

        // Warehouse
        $warehousePerms = [
            $permissionModels['view-dashboard']->id,
            $permissionModels['manage-inventory']->id,
            $permissionModels['manage-deliveries']->id,
        ];
        $roleModels['warehouse']->permissions()->sync($warehousePerms);

        // Accounts
        $accountsPerms = [
            $permissionModels['view-dashboard']->id,
            $permissionModels['record-payments']->id,
            $permissionModels['view-reports']->id,
        ];
        $roleModels['accounts']->permissions()->sync($accountsPerms);

        // Delivery
        $deliveryPerms = [
            $permissionModels['view-dashboard']->id,
            $permissionModels['manage-deliveries']->id,
        ];
        $roleModels['delivery']->permissions()->sync($deliveryPerms);

        // 4. Create Seed Users
        $defaultPassword = Hash::make('password123');

        $users = [
            [
                'name' => 'ERP Administrator',
                'email' => 'admin@tileserp.com',
                'role' => 'admin',
            ],
            [
                'name' => 'ERP Store Manager',
                'email' => 'manager@tileserp.com',
                'role' => 'manager',
            ],
            [
                'name' => 'ERP Sales Representative',
                'email' => 'sales@tileserp.com',
                'role' => 'sales',
            ],
            [
                'name' => 'ERP Warehouse Operator',
                'email' => 'warehouse@tileserp.com',
                'role' => 'warehouse',
            ],
            [
                'name' => 'ERP Accounts Officer',
                'email' => 'accounts@tileserp.com',
                'role' => 'accounts',
            ],
            [
                'name' => 'ERP Delivery Coordinator',
                'email' => 'delivery@tileserp.com',
                'role' => 'delivery',
            ],
        ];

        foreach ($users as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => $defaultPassword,
            ]);

            $user->roles()->attach($roleModels[$u['role']]->id);
        }
    }
}
