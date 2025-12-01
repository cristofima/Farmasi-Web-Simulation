"""
Script to convert Excel files (.xlsx) to CSV (.csv)

This script is used to convert the Activity Report downloaded from
Farmasi Back Office into a CSV format that can be imported into
the Farmasi Web Simulation application.
"""

import pandas as pd
import sys
import os


def xlsx_to_csv(input_file: str, output_file: str = None, sheet_name: str | int = 0) -> str:
    """
    Converts an Excel file (.xlsx) to CSV (.csv)
    
    Args:
        input_file: Path to the input Excel file
        output_file: Path to the output CSV file (optional)
        sheet_name: Name or index of the sheet to convert (default: first sheet)
    
    Returns:
        Path to the generated CSV file
    """
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"File '{input_file}' does not exist")
    
    if not input_file.lower().endswith(('.xlsx', '.xls')):
        raise ValueError("File must be an Excel file (.xlsx or .xls)")
    
    # If no output file is specified, use the same name with .csv extension
    if output_file is None:
        output_file = os.path.splitext(input_file)[0] + '.csv'
    
    # Read the Excel file
    df = pd.read_excel(input_file, sheet_name=sheet_name)
    
    # Save as CSV
    df.to_csv(output_file, index=False, encoding='utf-8')
    
    print(f"✓ File converted successfully: {output_file}")
    print(f"  - Rows: {len(df)}")
    print(f"  - Columns: {len(df.columns)}")
    
    return output_file


def convert_all_sheets(input_file: str, output_dir: str = None) -> list[str]:
    """
    Converts all sheets from an Excel file to separate CSV files
    
    Args:
        input_file: Path to the input Excel file
        output_dir: Output directory (optional)
    
    Returns:
        List of paths to the generated CSV files
    """
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"File '{input_file}' does not exist")
    
    # Output directory
    if output_dir is None:
        output_dir = os.path.dirname(input_file) or '.'
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Read all sheets
    xlsx = pd.ExcelFile(input_file)
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    
    output_files = []
    
    for sheet_name in xlsx.sheet_names:
        df = pd.read_excel(xlsx, sheet_name=sheet_name)
        output_file = os.path.join(output_dir, f"{base_name}_{sheet_name}.csv")
        df.to_csv(output_file, index=False, encoding='utf-8')
        output_files.append(output_file)
        print(f"✓ Sheet '{sheet_name}' -> {output_file} ({len(df)} rows)")
    
    return output_files


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python xlsx_to_csv.py <file.xlsx> [output_file.csv]")
        print("  python xlsx_to_csv.py <file.xlsx> --all  # Convert all sheets")
        print()
        print("Examples:")
        print("  python xlsx_to_csv.py activity_report.xlsx")
        print("  python xlsx_to_csv.py activity_report.xlsx output.csv")
        print("  python xlsx_to_csv.py activity_report.xlsx --all")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    if len(sys.argv) > 2 and sys.argv[2] == '--all':
        # Convert all sheets
        convert_all_sheets(input_file)
    elif len(sys.argv) > 2:
        # Output file specified
        xlsx_to_csv(input_file, sys.argv[2])
    else:
        # Input file only
        xlsx_to_csv(input_file)
