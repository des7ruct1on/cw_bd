import { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../utils/Api";
import { get_token } from "../utils/cookies";

const tables = {
    product: {},
    roles: {},
    users: {},
    customer: {},
    shipment_method: {},
    orders: {},
    log: {},
};

// Стили
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
`;

const Button = styled.button`
    margin: 5px;
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #0056b3;
    }
`;

const TableContainer = styled.div`
    width: 80%;
    min-height: 300px;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    background-color: #f9f9f9;
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #007bff;
        color: white;
    }

    .delete-button {
        background: none;
        border: none;
        color: #dc3545;
        cursor: pointer;
        font-size: 16px;
    }

    .delete-button:hover {
        text-decoration: underline;
    }

    .edit-button {
        background: none;
        border: none;
        color: #28a745;
        cursor: pointer;
        font-size: 16px;
    }

    .edit-button:hover {
        text-decoration: underline;
    }
`;

const Placeholder = styled.div`
    text-align: center;
    color: #888;
`;

const AddButton = styled(Button)`
    background-color: #28a745;
    margin-top: 10px;

    &:hover {
        background-color: #218838;
    }
`;

const SaveButton = styled(Button)`
    background-color: #ffc107;
    margin-top: 10px;

    &:hover {
        background-color: #e0a800;
    }
`;

const BackupButton = styled(Button)`
    background-color: #17a2b8;
    margin-top: 10px;

    &:hover {
        background-color: #138496;
    }
`;

const TableButtons = () => {
    const [data, setData] = useState([]); // Данные из таблицы
    const [currentTable, setCurrentTable] = useState(null); // Текущая таблица
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [newRow, setNewRow] = useState(null); // Индекс новой строки
    const [editing, setEditing] = useState(null); // Индекс редактируемой ячейки
    const [editedValue, setEditedValue] = useState(''); // Значение редактируемой ячейки
    const [backups, setBackups] = useState([]); // Список бекапов
    const [backupName, setBackupName] = useState(''); // Имя для нового бекапа
    const [analyticsVisible, setAnalyticsVisible] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        const fetchBackups = async () => {
            const token = get_token();
            if (!token) {
                console.warn("No token found.");
                return;
            }

            try {
                const response = await api.getAllBackups(token);
                setBackups(response.backups || []);
            } catch (error) {
                console.warn("Error fetching backups:", error);
            }
        };

        fetchBackups();
    }, []);

    const fetchData = (tableName) => {
        setLoading(true);
        setCurrentTable(tableName);
        setNewRow(null);

        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }

        api.getFullTable(token, tableName)
            .then(data => {
                if (typeof data[0] !== 'string') {
                    return data;
                }
                const prepared_data = data.reduce((column , key) => {
                    column[key] = null;
                    return column;
                }, {});
                return [prepared_data];
            })
            .then(data => {
                console.log(data);
                setData(data);
            })
            .catch(error => {
                console.warn(error);
                setData([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }
        console.log({
            table_name: currentTable,
            id,
        });
        api.deleteRow(token, {
            table_name: currentTable,
            id,
        })
            .then(() => {
                fetchData(currentTable);
            })
            .catch(error => {
                console.warn(error);
            });
    };

    const handleAddNewRow = () => {
        if (!currentTable) return;

        // Флаг для новой строки (сохраняем индекс)
        setNewRow(data.length);

        // Создаем новую строку с пустыми значениями
        const newRow = {};
        if (data.length > 0) {
            Object.keys(data[0]).forEach((key) => {
                newRow[key] = '';
            });
        }
        setData((prevData) => [...prevData, newRow]);
    };

    const handleInputChange = (e, rowIndex, key) => {
        const newData = [...data];
        newData[rowIndex][key] = e.target.value;
        setData(newData);
    };

    const handleDeleteNewRow = () => {
        // Удаляем последнюю строку, которая была новой
        setData((prevData) => prevData.slice(0, -1));
        setNewRow(null);
    };

    const handleSaveNewRow = async () => {
        if (!currentTable || newRow === null) return;
    
        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }
    
        const newRowData = data[data.length - 1];
    
        // Получаем только те столбцы, которые были изменены (проверка по данным)
        const changedColumns = Object.keys(newRowData).filter(key => newRowData[key] !== ''); // Убираем пустые значения
    
        // Отправляем только те столбцы, которые были изменены
        api.insertRow(token, {
            table_name: currentTable,
            columns: changedColumns,
            values: changedColumns.map(column => newRowData[column]) // Значения для измененных столбцов
        })
            .then(() => {
                fetchData(currentTable);
                setNewRow(null);
            })
            .catch(error => {
                console.warn(error);
            });
    };
    

    const handleEditField = (rowIndex, key) => {
        setEditing({ rowIndex, key });
        setEditedValue(data[rowIndex][key]);
    };

    const handleFieldChange = (e) => {
        setEditedValue(e.target.value);
    };

    const handleSaveField = (id) => {
        if (!currentTable || !editing) return;

        const { rowIndex, key } = editing;
        const newData = [...data];
        newData[rowIndex][key] = editedValue;
        setData(newData);

        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }
        console.log({
            table_name: currentTable,
            column_name: key,
            new_value: editedValue,
            id
        });

        api.updateValue(token, {
            table_name: currentTable,
            column_name: key,
            new_value: editedValue,
            id
        })
            .then(() => {
                fetchData(currentTable);
                setEditing(null);
                setEditedValue('');
            })
            .catch(error => {
                console.warn(error);
            });
    };

    const handleCreateBackup = async () => {
        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }

        if (backupName) {
            try {
                await api.createBackup(token, backupName);
                setBackupName('');
                // After backup is created, refresh backups list
                const response = await api.getAllBackups(token);
                setBackups(response.backups || []);
            } catch (error) {
                console.warn("Error creating backup:", error);
            }
        }
    };

    const handleDeleteBackup = async (backupName) => {
        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }

        try {
            await api.deleteBackup(token, backupName);
            // Refresh backups list after deletion
            const response = await api.getAllBackups(token);
            setBackups(response.backups || []);
        } catch (error) {
            console.warn("Error deleting backup:", error);
        }
    };

    const handleRestoreBackup = async (backupName) => {
        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }

        try {
            await api.restoreBackup(token, backupName);
            alert(`Бекап ${backupName} восстановлен.`);
        } catch (error) {
            console.warn("Error restoring backup:", error);
        }
    };

    const handleToggleAnalytics = async () => {
        setAnalyticsVisible(!analyticsVisible);

        if (analyticsVisible) {
            return;
        }

        const token = get_token();
        if (!token) {
            console.warn("No token found.");
            return;
        }

        api.getOrderSummary(token)
            .then(data => {
                console.log(data.data);
                setAnalyticsData(data.data[0]);
            })
            .catch(err => {
                console.warn(err);
            });
    };

    return (
        <PageContainer>
            <ButtonContainer>
                {Object.keys(tables).map((tableName) => (
                    <Button key={tableName} onClick={() => fetchData(tableName)}>
                        {tableName}
                    </Button>
                ))}
            </ButtonContainer>

            <ButtonContainer>
                {currentTable && (
                    <>
                        <AddButton onClick={handleAddNewRow}>
                            Добавить запись
                        </AddButton>
                        {newRow !== null && (
                            <Button onClick={handleDeleteNewRow} style={{ backgroundColor: "#dc3545" }}>
                                Удалить новую строку
                            </Button>
                        )}
                    </>
                )}
            </ButtonContainer>

            <ButtonContainer>
                <input
                    type="text"
                    placeholder="Имя для нового бекапа"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                />
                <BackupButton onClick={handleCreateBackup}>
                    Создать бекап
                </BackupButton>
            </ButtonContainer>

            <TableContainer>
                {loading ? (
                    <Placeholder>Загрузка данных...</Placeholder>
                ) : currentTable && data.length > 0 ? (
                    <Table>
                        <thead>
                            <tr>
                                {/* Сначала добавляем primary key */}
                                <th>{`${currentTable}_id`}</th>
                                {Object.keys(data[0]).filter(key => key !== `${currentTable}_id`).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => {
                                const hasNullValue = Object.values(row).includes(null); // Проверяем, есть ли хотя бы одно значение null в строке

                                return (
                                    <tr key={row[`${currentTable}_id`]}>
                                        {/* Сначала отображаем primary key */}
                                        <td>{row[`${currentTable}_id`]}</td>
                                        {Object.keys(row).filter(key => key !== `${currentTable}_id`).map((key) => (
                                            <td key={key}>
                                                {row[key] === null ? (
                                                    // Если значение равно null, показываем пустое поле или какое-то сообщение
                                                    <span>Нет данных</span>
                                                ) : rowIndex === newRow ? (
                                                    <input
                                                        type="text"
                                                        value={row[key]}
                                                        onChange={(e) => handleInputChange(e, rowIndex, key)}
                                                    />
                                                ) : editing && editing.rowIndex === rowIndex && editing.key === key ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={editedValue}
                                                            onChange={handleFieldChange}
                                                        />
                                                        <button onClick={() => handleSaveField(row[`${currentTable}_id`])}>Сохранить</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {row[key]}
                                                        <button className="edit-button" onClick={() => handleEditField(rowIndex, key)}>
                                                            ✏️
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        ))}
                                        <td>
                                            {rowIndex === newRow ? (
                                                <>
                                                    <button onClick={handleSaveNewRow}>Сохранить</button>
                                                    <button onClick={handleDeleteNewRow} style={{ backgroundColor: "#dc3545" }}>
                                                        Удалить
                                                    </button>
                                                </>
                                            ) : !hasNullValue && (
                                                <>
                                                    <button className="delete-button" onClick={() => handleDelete(row[`${currentTable}_id`])}>
                                                        Удалить
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                ) : (
                    <Placeholder>Нет данных</Placeholder>
                )}
            </TableContainer>



            <Button onClick={handleToggleAnalytics}>
                {analyticsVisible ? "Скрыть аналитику" : "Показать аналитику"}
            </Button>

            {analyticsVisible && analyticsData && (
                <AnalyticsContainer>
                    <h3>Аналитика по заказам</h3>
                    <AnalyticsTable>
                        <thead>
                            <tr>
                                <th>Средняя стоимость</th>
                                <th>Общая стоимость</th>
                                <th>Количество заказов</th>
                            </tr>
                        </thead>
                        <tbody>
                                <tr key='славаевропеоидам'>
                                    <td>{analyticsData.average_amount}</td>
                                    <td>{analyticsData.total_amount}</td>
                                    <td>{analyticsData.total_orders}</td>
                                </tr>
                        </tbody>
                    </AnalyticsTable>
                </AnalyticsContainer>
            )}

            <div>
                <h3>Список бекапов</h3>
                {backups.length > 0 ? (
                    <Table>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.map((backup) => (
                                <tr key={backup}>
                                    <td>{backup}</td>
                                    <td>
                                        <button onClick={() => handleRestoreBackup(backup)}>Восстановить</button>
                                        <button onClick={() => handleDeleteBackup(backup)} style={{ backgroundColor: "#dc3545" }}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Placeholder>Нет доступных бекапов</Placeholder>
                )}
            </div>
        </PageContainer>
    );
};

export default TableButtons;

const AnalyticsContainer = styled.div`
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #f9f9f9;
    width: 80%;
`;

const AnalyticsTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #007bff;
        color: white;
    }
`;