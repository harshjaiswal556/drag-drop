import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css'
const TableRow = ({ row, index, moveRow }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: 'row',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (
        (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
        (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
      ) {
        return;
      }
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'row',
    item: { type: 'row', id: row.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  drag(drop(ref));

  return (
    <tr ref={ref} style={{ opacity }}>
      {row.cells.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  );
};
const TableColumn = ({ column, index, moveColumn, children }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: 'column',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: { type: 'column', id: column.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  drag(drop(ref));

  return (
    <th ref={ref} style={{
      opacity,
      padding: '8px',
      backgroundColor: '#9f9f9f',
      cursor: 'move',
    }}>
      {children}
    </th>
  );
};


const DragDropTable = ({ data }) => {
  const [columns, setColumns] = useState(data.columns);
  const [rows, setRows] = useState(data.rows);

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRow = rows[dragIndex];
    setRows((prevState) => {
      const updatedRows = [...prevState];
      updatedRows.splice(dragIndex, 1);
      updatedRows.splice(hoverIndex, 0, dragRow);
      return updatedRows;
    });
  };

  const moveColumn = (dragIndex, hoverIndex) => {
    const dragColumn = columns[dragIndex];
    setColumns((prevState) => {
      const updatedColumns = [...prevState];
      updatedColumns.splice(dragIndex, 1);
      updatedColumns.splice(hoverIndex, 0, dragColumn);
      return updatedColumns;
    });

    setRows((prevState) => {
      const updatedRows = prevState.map((row) => {
        const newRow = [...row.cells];
        newRow.splice(dragIndex, 1);
        newRow.splice(hoverIndex, 0, row.cells[dragIndex]);
        return { id: row.id, cells: newRow };
      });
      return updatedRows;
    });
  };

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <TableColumn
              key={column.id}
              index={index}
              column={column}
              moveColumn={moveColumn}
            >
              {column.title}
            </TableColumn>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <TableRow key={row.id} index={index} row={row} moveRow={moveRow} />
        ))}
      </tbody>
    </table>
  );
};

const App = () => {
  const data = {
    columns: [
      { id: 1, title: 'Name' },
      { id: 2, title: 'Age' },
      { id: 3, title: 'Address' },
    ],
    rows: [
      { id: 1, cells: ['Harsh', '30', 'Bangalore'] },
      { id: 2, cells: ['Raj', '25', 'Delhi'] },
      { id: 3, cells: ['Jerry', '35', 'Mumbai'] },
    ],
  };

  return (
    <div className='container'>
      <h1>Draggable Column and Row Table</h1>
      <DndProvider backend={HTML5Backend}>
        <DragDropTable data={data} />
      </DndProvider>
    </div>
  );
};

export default App;
