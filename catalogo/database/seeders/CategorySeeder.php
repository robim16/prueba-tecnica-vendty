<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Burgers', 'slug' => 'burgers'],
            ['name' => 'Pizzas', 'slug' => 'pizzas'],
            ['name' => 'Bebidas', 'slug' => 'bebidas'],
            ['name' => 'Postres', 'slug' => 'postres'],
            ['name' => 'Ensaladas', 'slug' => 'ensaladas'],
        ];

        foreach ($categories as $category) {
            Categorie::updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}

