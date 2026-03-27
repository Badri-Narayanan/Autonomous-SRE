import time

COLORS = {
    'reset':  '\033[0m',
    'green':  '\033[92m',
    'yellow': '\033[93m',
    'cyan':   '\033[96m',
    'red':    '\033[91m',
    'bold':   '\033[1m',
    'dim':    '\033[2m',
}

def log_trace(step_name, details, level="info"):
    timestamp = time.strftime("%H:%M:%S")

    color_map = {
        "info":    COLORS['cyan'],
        "success": COLORS['green'],
        "warning": COLORS['yellow'],
        "error":   COLORS['red'],
    }
    color = color_map.get(level, COLORS['cyan'])

    print(f"\n{color}{COLORS['bold']}[{timestamp}] 🔍 OVERMIND TRACE: {step_name}{COLORS['reset']}")
    print(f"   {COLORS['dim']}↳ {details}{COLORS['reset']}")
    print(f"   {COLORS['dim']}{'─' * 52}{COLORS['reset']}")