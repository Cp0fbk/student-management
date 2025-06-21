'use client'

import {
  flexRender,
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  total: number
  currentPage: number
  onPageChange: (page: number) => void
  onEdit: (student: TData) => void
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export function DataTable<TData extends { id: number }, TValue>({
  columns,
  data,
  total,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  isDeleting = false
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(currentPage - 1)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    rowId: number | null
  } | null>(null)
  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex,
        pageSize
      }
    },
    pageCount: totalPages,
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater
      setPageIndex(newState.pageIndex)
      onPageChange(newState.pageIndex + 1)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  })

  return (
    <div className='flex flex-col min-h-[500px] justify-between space-y-4'>
      <div className='rounded-md border overflow-x-auto shadow-2xl'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className='bg-gray-600 font-bold px-10 py-4 text-center text-white'>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className='hover:bg-gray-200 cursor-pointer'
                  onClick={() => onEdit(row.original)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      rowId: row.original.id
                    })
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='px-10 py-3 text-center'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex justify-between items-center mt-2'>
        <div className='text-sm text-muted-foreground'>
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} results
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
        {contextMenu && (
          <div
            className='absolute bg-white border shadow-md z-50 rounded-md'
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={() => {
              const target = data.find((s) => s.id === contextMenu.rowId)
              if (!target) return
              onEdit(target)
              setContextMenu(null)
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className='px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                if (contextMenu.rowId) {
                  onDelete(contextMenu.rowId)
                }
                setContextMenu(null)
              }}
              style={{ opacity: isDeleting ? 0.5 : 1 }}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa sinh viên'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
