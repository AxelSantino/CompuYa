import React from 'react';

export interface Column<T> {
  header: string; // El título que va en el Thead
  // El accessor puede ser una clave directa del objeto o una función para renderizados complejos
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string; // Opcional: para anchos o alineaciones específicas
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  // keyExtractor es crucial en React para el atributo 'key' de las listas iteradas
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
}

// 3. El Componente (Usamos function clásica para soportar generics de forma más limpia en TSX)
export function DataTable<T>({ 
  columns, 
  data, 
  keyExtractor, 
  emptyMessage = "No se encontraron resultados." 
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {/* Si el accessor es una función, la ejecutamos pasando la fila. Si no, leemos la propiedad */}
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
          
          {/* Renderizado de estado vacío */}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}